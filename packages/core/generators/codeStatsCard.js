const { createCard } = require("./svgGenerator");

/**
 * Generate code stats SVG card
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

module.exports = { renderCodeStatsCard };