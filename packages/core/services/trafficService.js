const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../core/rateLimiter");

async function fetchRepoTraffic(repoName) {
    try {
        const data = await requestWithRetry({
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/traffic/views`,
        });

        return {
            views: data.count || 0,
            uniques: data.uniques || 0,
        };
    } catch (error) {
        // Traffic may fail if permissions missing
        console.log(`⚠️ Skipping traffic for ${repoName}`);
        return { views: 0, uniques: 0 };
    }
}

async function calculateTrafficStats(repos) {
    let totalViews = 0;
    let totalUniqueVisitors = 0;

    console.log("\n👀 Fetching traffic data for each repository...");

    const tasks = repos.map((repo) =>
        limit(async () => {
            const traffic = await fetchRepoTraffic(repo.name);
            totalViews += traffic.views;
            totalUniqueVisitors += traffic.uniques;
        })
    );

    await Promise.all(tasks);

    console.log("✅ Traffic aggregation complete");

    return {
        totalViews,
        totalUniqueVisitors,
    };
}

module.exports = { calculateTrafficStats };
