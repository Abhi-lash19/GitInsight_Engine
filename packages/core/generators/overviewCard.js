const { createCard, saveSVG } = require("./svgGenerator");
/**
 * Generate overview SVG card
 */
function generateOverviewCard(username, stats, themeName = process.env.CARD_THEME || "dark") {
    const insights = stats.insights || {};

    const svg = createCard({
        title: "GitHub Overview",
        themeName,
        lines: [
            `Repos: ${stats.totalRepos}`,
            `Stars: ${stats.totalStars}`,
            `Forks: ${stats.totalForks}`,
            `Contributions: ${stats.totalContributions}`,
            `Productivity: ${insights.productivityScore || 0}`,
            `Activity: ${insights.activityLevel || "N/A"}`,
        ],
    });

    saveSVG(username, "overview", svg);
}

module.exports = { generateOverviewCard };
