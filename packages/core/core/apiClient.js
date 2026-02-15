const axios = require("axios");
const githubConfig = require("../config/githubConfig");

const etagStore = new Map();

const apiClient = axios.create({
    baseURL: githubConfig.restBaseUrl,
    headers: {
        Authorization: `Bearer ${githubConfig.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": githubConfig.apiVersion,
    },
    timeout: 15000,
});

async function requestWithRetry(config, retries = 3) {
    const key = `${config.method}:${config.url}`;
    const start = Date.now();

    if (etagStore.has(key)) {
        config.headers = {
            ...config.headers,
            "If-None-Match": etagStore.get(key),
        };
    }

    try {
        const response = await apiClient(config);

        if (response.headers.etag) {
            etagStore.set(key, response.headers.etag);
        }

        console.log(`⏱ ${config.url} → ${Date.now() - start}ms`);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const headers = error.response?.headers;

        if (status === 304) {
            console.log(`⚡ ${config.url} → Not Modified (ETag)`);
            return null;
        }

        if (status === 202 && retries > 0) {
            console.log("⏳ GitHub processing data... retrying");
            await new Promise((res) => setTimeout(res, 2000));
            return requestWithRetry(config, retries - 1);
        }

        if (status === 403 && headers?.["x-ratelimit-remaining"] === "0") {
            const resetTime = parseInt(headers["x-ratelimit-reset"], 10) * 1000;
            const waitTime = resetTime - Date.now();

            if (waitTime > 0) {
                console.log(`⚠️ Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s`);
                await new Promise((res) => setTimeout(res, waitTime));
                return requestWithRetry(config, retries - 1);
            }
        }

        throw new Error(
            `GitHub API Error: ${status || "UNKNOWN"} → ${config.url}`
        );
    }
}

module.exports = { requestWithRetry };
