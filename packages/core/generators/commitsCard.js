const { createCard } = require("./svgGenerator");

/**
 * Generate commits per repo SVG card
 */
function renderCommitsCard(stats, options = {}) {
    const { theme = "dark" } = options;

    const commits = stats.commitsPerRepo || {};
    const sorted = Object.entries(commits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const lines = sorted.map(([repo, count]) => `${repo}: ${count}`);

    return createCard({
        title: "Commits Distribution",
        lines,
        themeName: theme,
    });
}

module.exports = { renderCommitsCard };