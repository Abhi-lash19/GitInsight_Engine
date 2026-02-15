const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../core/rateLimiter");

const {
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
} = require('../cache/cacheManager');

async function fetchRepoCodeFrequency(repoName) {
    if (isRepoCacheValid(githubConfig.username, repoName, "codefreq")) {
        return readRepoCache(githubConfig.username, repoName, "codefreq");
    }

    try {
        const data = await requestWithRetry(
            {
                method: "GET",
                url: `/repos/${githubConfig.username}/${repoName}/stats/code_frequency`,
            },
            5
        );

        writeRepoCache(githubConfig.username, repoName, "codefreq", data || []);
        return data || [];
    } catch {
        return [];
    }
}

async function calculateCodeFrequencyStats(repos) {
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    console.log("\n🧮 Fetching code frequency data for each repository...");

    const tasks = repos.map((repo) =>
        limit(async () => {
            const weeklyStats = await fetchRepoCodeFrequency(repo.name);

            if (Array.isArray(weeklyStats)) {
                weeklyStats.forEach((week) => {
                    const additions = week[1] || 0;
                    const deletions = week[2] || 0;

                    totalLinesAdded += additions;
                    totalLinesDeleted += Math.abs(deletions);
                });
            }
        })
    );

    await Promise.all(tasks);

    console.log("✅ Code frequency aggregation complete");

    return {
        totalLinesAdded,
        totalLinesDeleted,
        netLines: totalLinesAdded - totalLinesDeleted,
    };
}

module.exports = { calculateCodeFrequencyStats };
