const { requestWithRetry } = require("../clients/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../clients/rateLimiter");

async function fetchRepoCodeFrequency(repoName) {
    try {
        const data = await requestWithRetry({
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/stats/code_frequency`,
        });

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

async function calculateCodeFrequencyStats(repos) {

    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    console.log("\n📊 Fetching code frequency stats...");

    const tasks = repos.map(repo =>
        limit(async () => {

            const weeks = await fetchRepoCodeFrequency(repo.name);

            for (const week of weeks) {

                const additions = week[1] || 0;
                const deletions = Math.abs(week[2] || 0);

                totalLinesAdded += additions;
                totalLinesDeleted += deletions;
            }
        })
    );

    await Promise.all(tasks);

    return {
        totalLinesAdded,
        totalLinesDeleted,
        netLines: totalLinesAdded - totalLinesDeleted,
    };
}

module.exports = { calculateCodeFrequencyStats };
