const { createCard } = require("./svgGenerator");
/**
 * Generate overview SVG card
 */
function renderOverviewCard(stats, options = {}) {
    const {
        theme = "dark",
        hide = [],
        compact = false,
    } = options;

    const insights = stats.insights || {};

    const lines = [];

    if (!hide.includes("repos"))
        lines.push(`Repos: ${stats.totalRepos}`);

    if (!hide.includes("stars"))
        lines.push(`Stars: ${stats.totalStars}`);

    if (!hide.includes("forks"))
        lines.push(`Forks: ${stats.totalForks}`);

    if (!hide.includes("contributions"))
        lines.push(`Contributions: ${stats.totalContributions}`);

    if (!compact) {
        lines.push(`Productivity: ${insights.productivityScore || 0}`);
        lines.push(`Activity: ${insights.activityLevel || "N/A"}`);
    }

    return createCard({
        title: "GitHub Overview",
        lines,
        themeName: theme,
    });
}

module.exports = { renderOverviewCard };
