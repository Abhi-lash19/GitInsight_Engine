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

async function requestWithRetry(config, retries = 3) {
    try {
        const response = await apiClient(config);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const headers = error.response?.headers;

        // Handle async GitHub stats processing
        if (status === 202 && retries > 0) {
            console.log("⏳ GitHub processing data... retrying");
            await new Promise((res) => setTimeout(res, 2000));
            return requestWithRetry(config, retries - 1);
        }

        // Proper rate limit handling
        if (status === 403 && headers?.["x-ratelimit-remaining"] === "0") {
            const resetTime = parseInt(headers["x-ratelimit-reset"], 10) * 1000;
            const waitTime = resetTime - Date.now();

            if (waitTime > 0) {
                console.log(`⚠️ Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
                await new Promise((res) => setTimeout(res, waitTime));
                return requestWithRetry(config, retries - 1);
            }
        }

        throw error;
    }
}

module.exports = { requestWithRetry };
