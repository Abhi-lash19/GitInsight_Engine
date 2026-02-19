const axios = require("axios");
const githubConfig = require("../config/githubConfig");

async function graphqlRequest(query, variables = {}, retries = 6) {
    const start = Date.now();

    try {
        const response = await axios.post(
            githubConfig.graphqlUrl,
            { query, variables },
            {
                headers: {
                    Authorization: `Bearer ${githubConfig.token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`⏱ GraphQL request → ${Date.now() - start}ms`);

        if (response.data.errors) {
            throw new Error(JSON.stringify(response.data.errors));
        }

        return response.data.data;

    } catch (error) {
        const status = error.response?.status;
        const headers = error.response?.headers;

        // 🔄 Retry on transient server responses
        if (status === 202 && retries > 0) {
            const delay = 5000;
            console.log(`⏳ GraphQL processing... waiting ${delay / 1000}s`);
            await new Promise((res) => setTimeout(res, delay));
            return graphqlRequest(query, variables, retries - 1);
        }

        // 🚦 Rate limit handling
        if (status === 403 && headers?.["x-ratelimit-remaining"] === "0") {
            const resetTime = parseInt(headers["x-ratelimit-reset"], 10) * 1000;
            const waitTime = resetTime - Date.now();

            if (waitTime > 0 && retries > 0) {
                console.log(`⚠️ Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s`);
                await new Promise((res) => setTimeout(res, waitTime));
                return graphqlRequest(query, variables, retries - 1);
            }
        }

        throw error;
    }
}

module.exports = {
    graphqlRequest,
};
