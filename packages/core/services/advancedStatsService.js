const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../core/rateLimiter");
const {
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
} = require('../cache/cacheManager');

async function fetchCommitActivity(repoName) {
    if (isRepoCacheValid(githubConfig.username, repoName, "commit")) {
        return readRepoCache(githubConfig.username, repoName, "commit");
    }

    try {
        const data = await requestWithRetry(
            {
                method: "GET",
                url: `/repos/${githubConfig.username}/${repoName}/stats/commit_activity`,
            },
            5
        );

        writeRepoCache(githubConfig.username, repoName, "commit", data || []);
        return data || [];
    } catch {
        return [];
    }
}

async function calculateAdvancedCommitStats(repos, languageStats) {
    const commitsPerRepo = {};
    const weeklyCommitTrend = new Array(52).fill(0);
    let totalCommits = 0;

    const tasks = repos.map((repo) =>
        limit(async () => {
            const weeklyData = await fetchCommitActivity(repo.name);

            if (!Array.isArray(weeklyData)) {
                commitsPerRepo[repo.name] = 0;
                return;
            }

            let repoCommits = 0;

            weeklyData.forEach((week, index) => {
                if (!week || typeof week !== "object") return;

                const commits = week.total || 0;

                repoCommits += commits;

                if (index < 52) {
                    weeklyCommitTrend[index] += commits;
                }
            });

            commitsPerRepo[repo.name] = repoCommits;
            totalCommits += repoCommits;
        })
    );

    await Promise.all(tasks);

    // Estimate commits by language
    const commitsByLanguage = {};
    Object.entries(languageStats || {}).forEach(([lang, percent]) => {
        const numericPercent = parseFloat(percent);
        if (!isNaN(numericPercent)) {
            commitsByLanguage[lang] = Math.round(
                (numericPercent / 100) * totalCommits
            );
        }
    });

    return {
        totalCommits,
        commitsPerRepo,
        weeklyCommitTrend,
        commitsByLanguage,
    };
}

module.exports = { calculateAdvancedCommitStats };