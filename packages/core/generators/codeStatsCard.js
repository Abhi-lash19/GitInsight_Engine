const { createCard } = require("./svgGenerator");

/**
 * Dashboard content renderer
 */
function renderCodeStatsContent(stats) {

    const code = stats.codeStats || {};

    return `
<text x="0" y="0">Lines Added: ${code.totalLinesAdded ?? 0}</text>
<text x="0" y="18">Lines Deleted: ${code.totalLinesDeleted ?? 0}</text>
<text x="0" y="36">Net Lines: ${code.netLines ?? 0}</text>
`;
}

/**
 * Standalone SVG card
 */
function renderCodeStatsCard(stats, options = {}) {
    const { theme = "dark" } = options;

    const code = stats.codeStats || {};

    const lines = [
        `Lines Added: ${code.totalLinesAdded ?? 0}`,
        `Lines Deleted: ${code.totalLinesDeleted ?? 0}`,
        `Net Lines: ${code.netLines ?? 0}`,
    ];

    return createCard({
        title: "Code Statistics",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderCodeStatsCard,
    renderCodeStatsContent
};