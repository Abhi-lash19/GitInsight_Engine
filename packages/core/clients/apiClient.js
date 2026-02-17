const axios = require("axios");
const githubConfig = require("../config/githubConfig");

const apiClient = axios.create({
    baseURL: githubConfig.restBaseUrl,
    headers: {
        Authorization: `Bearer ${githubConfig.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": githubConfig.apiVersion,
    },
    timeout: 15000,
});

async function requestWithRetry(config, retries = 6) {
    const start = Date.now();

    try {
        const response = await apiClient(config);

        console.log(`⏱ ${config.url} → ${Date.now() - start}ms`);
        return response.data;

    } catch (error) {
        const status = error.response?.status;
        const headers = error.response?.headers;

        // 🔄 GitHub stats still generating (code frequency endpoint)
        if (status === 202 && retries > 0) {
            const delay = 5000;
            console.log(`⏳ GitHub stats generating... waiting ${delay / 1000}s`);
            await new Promise((res) => setTimeout(res, delay));
            return requestWithRetry(config, retries - 1);
        }

        // 🚦 Rate limit handling
        if (status === 403 && headers?.["x-ratelimit-remaining"] === "0") {
            const resetTime = parseInt(headers["x-ratelimit-reset"], 10) * 1000;
            const waitTime = resetTime - Date.now();

            if (waitTime > 0 && retries > 0) {
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
