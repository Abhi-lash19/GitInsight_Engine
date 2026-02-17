const githubConfig = require("../config/githubConfig");
const { fetchAllRepos } = require("../services/repoService");
const { calculateLanguageStats } = require("../services/languageService");
const { fetchTotalContributions } = require("../services/contributionService");
const { calculateTrafficStats } = require("../services/trafficService");
const { calculateCodeFrequencyStats } = require("../services/codeFrequencyService");
const { calculateAdvancedCommitStats } = require("../services/advancedStatsService");
const { buildStats } = require("../aggregator/statsAggregator");

async function computeStats(username) {
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

    return buildStats(
        username,
        repos,
        languageStats,
        totalContributions,
        trafficStats,
        codeStats,
        advancedStats
    );
}

module.exports = { computeStats };
