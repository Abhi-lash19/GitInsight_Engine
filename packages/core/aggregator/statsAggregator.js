const { calculateTotalStars } = require("../services/starService");
const { calculateTotalForks } = require("../services/forkService");
const {
    calculateTopRepo,
    calculateAverageStars,
} = require("../services/analyticsService");
const { calculateRepoImpact } = require("../services/analyticsService");
const { calculateInsights } = require("../analytics/insightsEngine");

function buildStats(
    username,
    repos,
    languageStats,
    totalContributions,
    trafficStats,
    codeStats,
    advancedStats = {}
) {
    const insights = calculateInsights({
        totalCommits: advancedStats.totalCommits,
        weeklyCommitTrend: advancedStats.weeklyCommitTrend,
        codeStats,
        repos,
    });

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
        repoImpact: repos.map((r) => ({
            name: r.name,
            impactScore: calculateRepoImpact(r),
        })),
        ...advancedStats,
        insights,
    };
}

module.exports = { buildStats };
