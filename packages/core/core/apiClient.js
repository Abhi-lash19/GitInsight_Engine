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

        if (status === 202 && retries > 0) {
            console.log("⏳ GitHub processing data... retrying");
            await new Promise((res) => setTimeout(res, 2000));
            return requestWithRetry(config, retries - 1);
        }

        if (status === 403 && retries > 0) {
            console.log("⚠️ Rate limited. Waiting 5 seconds...");
            await new Promise((res) => setTimeout(res, 5000));
            return requestWithRetry(config, retries - 1);
        }

        throw error;
    }
}

module.exports = { requestWithRetry };
