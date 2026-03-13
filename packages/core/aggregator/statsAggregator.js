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
    advancedStats = {},
    contributions = [],
    repositories = []
) {
    const insights = calculateInsights({
        totalCommits: advancedStats.totalCommits,
        weeklyCommitTrend: advancedStats.weeklyCommitTrend,
        codeStats,
        repos,
    });

    // Extract commits from repositories (limit to 200 per repo)
    const commits = [];
    repositories.forEach(repo => {
        if (repo.commits && Array.isArray(repo.commits)) {
            const limitedCommits = repo.commits.slice(0, 200);
            limitedCommits.forEach(commit => {
                commits.push({
                    repo: repo.name,
                    date: commit.date
                });
            });
        }
    });

    // Build repositories array with required fields
    const repositoriesData = repositories.map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        createdAt: repo.createdAt
    }));

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
        // New fields for extended analytics
        contributions,
        commits,
        repositories: repositoriesData,
    };
}

module.exports = { buildStats };
