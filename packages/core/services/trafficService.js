const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../core/rateLimiter");

async function fetchRepoTraffic(repoName) {
    try {
        const data = await requestWithRetry({
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/traffic/views`,
        });

        if (!data) return { views: 0, uniques: 0 };

        return {
            views: data.count || 0,
            uniques: data.uniques || 0,
        };
    } catch {
        return { views: 0, uniques: 0 };
    }
}

async function calculateTrafficStats(repos) {
    let totalViews = 0;
    let totalUniqueVisitors = 0;

    console.log("\n👀 Fetching traffic data (best effort)...");

    const tasks = repos.map((repo) =>
        limit(async () => {
            const traffic = await fetchRepoTraffic(repo.name);
            totalViews += traffic.views;
            totalUniqueVisitors += traffic.uniques;
        })
    );

    await Promise.all(tasks);

    return {
        totalViews,
        totalUniqueVisitors,
    };
}

module.exports = { calculateTrafficStats };
