const { calculateTotalStars } = require("../services/starService");
const { calculateTotalForks } = require("../services/forkService");
const {
    calculateTopRepo,
    calculateAverageStars,
} = require("../services/analyticsService");

function buildStats(
    username,
    repos,
    languageStats,
    totalContributions,
    trafficStats,
    codeStats,
    advancedStats = {}
) {
    return {
        username,
        totalRepos: repos.length,
        totalStars: calculateTotalStars(repos),
        totalForks: calculateTotalForks(repos),
        languages: languageStats,
        totalContributions,
        topRepo: calculateTopRepo(repos),
        averageStarsPerRepo: calculateAverageStars(repos),
        traffic: trafficStats,
        codeStats,
        ...advancedStats,
    };
}

module.exports = { buildStats };
