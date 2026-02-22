const { createCard } = require("./svgGenerator");

/**
 * Generate developer insights SVG card
 */
function renderInsightsCard(stats, options = {}) {
    const {
        theme = "dark",
        compact = false,
    } = options;

    const insights = stats.insights || {};

    const lines = [
        `Productivity Score: ${insights.productivityScore ?? 0}`,
        `Activity Level: ${insights.activityLevel ?? "N/A"}`,
        `Churn Ratio: ${insights.churnRatio ?? 0}`,
        `Avg Commits/Week: ${insights.averageCommitsPerWeek ?? 0}`,
        `Most Active Week: ${insights.mostActiveWeek ?? "N/A"}`,
        `Repo Impact: ${insights.repoImpactScore ?? 0}`,
    ];

    if (!compact) {
        lines.push(`Total Commits: ${stats.totalCommits ?? 0}`);
    }

    return createCard({
        title: "Developer Insights",
        lines,
        themeName: theme,
    });
}

module.exports = { renderInsightsCard };