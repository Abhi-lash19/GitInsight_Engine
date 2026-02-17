const axios = require("axios");
const githubConfig = require("../config/githubConfig");

async function graphqlRequest(query, variables = {}) {
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

    if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
    }

    return response.data.data;
}

module.exports = {
    graphqlRequest,
};
