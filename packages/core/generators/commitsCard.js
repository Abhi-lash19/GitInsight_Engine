const { createCard } = require("./svgGenerator");

/**
 * Dashboard renderer
 */
function renderCommitsContent(stats) {

    const commits = stats.commitsPerRepo || {};
    const sorted = Object.entries(commits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    let y = 0;

    return sorted.map(([repo, count]) => {
        const line = `<text x="0" y="${y}">${repo}: ${count}</text>`;
        y += 18;
        return line;
    }).join("");
}

/**
 * Standalone card
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

module.exports = {
    renderCommitsCard,
    renderCommitsContent
};