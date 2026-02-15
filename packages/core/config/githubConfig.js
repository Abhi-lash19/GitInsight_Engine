require("dotenv").config();

const githubConfig = {
    username: process.env.GITHUB_USERNAME,
    token: process.env.GITHUB_TOKEN,
    restBaseUrl: "https://api.github.com",
    graphqlUrl: "https://api.github.com/graphql",
    apiVersion: "2022-11-28",
};

if (!githubConfig.token) {
    throw new Error("❌ GITHUB_TOKEN missing in .env file");
}

if (!githubConfig.username) {
    throw new Error("❌ GITHUB_USERNAME missing in .env file");
}

module.exports = githubConfig;
