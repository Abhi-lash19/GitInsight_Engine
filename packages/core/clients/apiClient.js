const axios = require("axios");
const githubConfig = require("../config/githubConfig");
const { getApiCache, setApiCache } = require("../cache/cacheManager");

const apiClient = axios.create({
    baseURL: githubConfig.restBaseUrl,
    headers: {
        Authorization: `Bearer ${githubConfig.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": githubConfig.apiVersion,
    },
    timeout: 15000,
});

function buildCacheKey(config) {
    const params = config.params ? JSON.stringify(config.params) : "";
    return `api:${config.method}:${config.url}:${params}`;
}

async function requestWithRetry(config, retries = 6) {
    const start = Date.now();
    const cacheKey = buildCacheKey(config);

    const cached = await getApiCache(cacheKey);
    const headers = config.headers || {};

    if (cached?.etag) {
        headers["If-None-Match"] = cached.etag;
    }

    try {
        const response = await apiClient({ ...config, headers });

        console.log(`⏱ ${config.url} → ${Date.now() - start}ms`);

        if (response.headers?.etag) {
            await setApiCache(cacheKey, {
                etag: response.headers.etag,
                data: response.data,
            });
        }

        return response.data;

    } catch (error) {
        const status = error.response?.status;
        const resHeaders = error.response?.headers;

        // 304 → use cached response
        if (status === 304 && cached?.data) {
            console.log(`🧠 Cache hit (ETag): ${config.url}`);
            return cached.data;
        }

        // GitHub stats still generating (code frequency endpoint)
        if (status === 202 && retries > 0) {
            const delay = 5000;
            console.log(`⏳ GitHub stats generating... waiting ${delay / 1000}s`);
            await new Promise((res) => setTimeout(res, delay));
            return requestWithRetry(config, retries - 1);
        }

        //  Rate limit handling
        if (status === 403 && resHeaders?.["x-ratelimit-remaining"] === "0") {
            const resetTime = parseInt(resHeaders["x-ratelimit-reset"], 10) * 1000;
            const waitTime = resetTime - Date.now();

            if (waitTime > 0 && retries > 0) {
                console.log(`⚠️ Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s`);
                await new Promise((res) => setTimeout(res, waitTime));
                return requestWithRetry(config, retries - 1);
            }
        }

        //  Transient GitHub errors (502/503/504)
        if ([502, 503, 504].includes(status) && retries > 0) {
            const delay = 2 ** (6 - retries) * 500;
            console.log(`🔁 Transient error ${status}. Retrying in ${delay}ms`);
            await new Promise((res) => setTimeout(res, delay));
            return requestWithRetry(config, retries - 1);
        }

        throw new Error(
            `GitHub API Error: ${status || "UNKNOWN"} → ${config.url}`
        );
    }
}

module.exports = { requestWithRetry };