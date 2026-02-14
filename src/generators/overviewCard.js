const { createCard, saveSVG } = require("./svgGenerator");

/**
 * Generate overview SVG card
 */
function generateOverviewCard(username, stats) {
    const svg = createCard({
        title: "GitHub Overview",
        lines: [
            `Repos: ${stats.totalRepos}`,
            `Stars: ${stats.totalStars}`,
            `Forks: ${stats.totalForks}`,
            `Contributions: ${stats.totalContributions}`,
        ],
    });

    saveSVG(username, "overview", svg);
}

module.exports = { generateOverviewCard };
