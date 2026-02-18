const githubConfig = require("../config/githubConfig");
const { fetchAllRepos } = require("../services/repoService");
const { calculateLanguageStats } = require("../services/languageService");
const { fetchTotalContributions } = require("../services/contributionService");
const { calculateTrafficStats } = require("../services/trafficService");
const { calculateCodeFrequencyStats } = require("../services/codeFrequencyService");
const { calculateAdvancedCommitStats } = require("../services/advancedStatsService");
const { buildStats } = require("../aggregator/statsAggregator");
const { getApiCache, setApiCache } = require("../cache/cacheManager");

async function computeStats(username) {
    const cacheKey = `stats:${username}`;
    const cached = await getApiCache(cacheKey);
    if (cached) return cached;

    githubConfig.username = username;

    const repos = await fetchAllRepos();

    const [
        languageStats,
        totalContributions,
        trafficStats,
        codeStats,
    ] = await Promise.all([
        calculateLanguageStats(repos),
        fetchTotalContributions(username),
        calculateTrafficStats(repos),
        calculateCodeFrequencyStats(repos),
    ]);

    const advancedStats = await calculateAdvancedCommitStats(
        repos,
        languageStats
    );

    const stats = buildStats(
        username,
        repos,
        languageStats,
        totalContributions,
        trafficStats,
        codeStats,
        advancedStats
    );

    await setApiCache(cacheKey, stats);

    return stats;
}

module.exports = { computeStats };
