const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../core/rateLimiter");

const {
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
} = require('../cache/cacheManager');

async function fetchRepoLanguages(repoName) {
    if (isRepoCacheValid(githubConfig.username, repoName, "languages")) {
        return readRepoCache(githubConfig.username, repoName, "languages");
    }

    const data = await requestWithRetry({
        method: "GET",
        url: `/repos/${githubConfig.username}/${repoName}/languages`,
    });

    writeRepoCache(githubConfig.username, repoName, "languages", data);
    return data;
}

async function calculateLanguageStats(repos) {
    const languageTotals = {};

    console.log("\n💻 Fetching language data for each repository...");

    const tasks = repos.map((repo) =>
        limit(async () => {
            const languages = await fetchRepoLanguages(repo.name);

            for (const [language, bytes] of Object.entries(languages)) {
                languageTotals[language] =
                    (languageTotals[language] || 0) + bytes;
            }
        })
    );

    await Promise.all(tasks);

    const totalBytes = Object.values(languageTotals).reduce(
        (sum, bytes) => sum + bytes,
        0
    );

    const languagePercentages = {};

    for (const [language, bytes] of Object.entries(languageTotals)) {
        languagePercentages[language] = (
            (bytes / totalBytes) *
            100
        ).toFixed(2);
    }

    // Sort descending
    const sortedLanguages = Object.fromEntries(
        Object.entries(languagePercentages).sort(
            (a, b) => b[1] - a[1]
        )
    );

    console.log("✅ Language aggregation complete");

    return sortedLanguages;
}

module.exports = { calculateLanguageStats };
