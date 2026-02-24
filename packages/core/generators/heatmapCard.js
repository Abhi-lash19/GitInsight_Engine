const { getTheme } = require("../themes");

/**
 * Professional GitHub-style 7x52 heatmap
 */
function renderHeatmapCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const themeObj = getTheme(theme);
    const { colors } = themeObj;

    const dailyData =
        stats.dailyCommitMatrix ||
        (() => {
            const fallback = [];
            const weekly = stats.weeklyCommitTrend || new Array(52).fill(0);
            for (let col = 0; col < 52; col++) {
                for (let row = 0; row < 7; row++) {
                    fallback.push(weekly[col] || 0);
                }
            }
            return fallback;
        })();

    const cols = 52;
    const rows = 7;

    const cellSize = 11;
    const gap = 4;

    const paddingX = 30;
    const paddingTop = 60;

    const gridWidth = cols * (cellSize + gap);
    const gridHeight = rows * (cellSize + gap);

    const width = paddingX * 2 + gridWidth;
    const height = paddingTop + gridHeight + 50;

    const max = Math.max(...dailyData, 1);

    function getGithubGreen(value) {
        if (value === 0) return "#161b22";

        const ratio = value / max;

        if (ratio < 0.25) return "#0e4429";
        if (ratio < 0.5) return "#006d32";
        if (ratio < 0.75) return "#26a641";
        return "#39d353";
    }

    let cells = "";

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const index = col * 7 + row;
            const value = dailyData[index] || 0;

            const x = paddingX + col * (cellSize + gap);
            const y = paddingTop + row * (cellSize + gap);

            cells += `
                <rect
                    x="${x}"
                    y="${y}"
                    width="${cellSize}"
                    height="${cellSize}"
                    rx="2"
                    fill="${getGithubGreen(value)}"
                />
            `;
        }
    }

    return `
<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">

    <rect width="100%" height="100%" rx="16" fill="${colors.bgStart}" stroke="${colors.border}" />

    <text x="${paddingX}" y="35" fill="${colors.title}" font-size="20" font-weight="600">
        52-Week Commit Heatmap
    </text>

    ${cells}

    <text x="${paddingX}" y="${height - 15}" fill="${colors.text}" font-size="12">
        Less
    </text>

    <text x="${width - 40}" y="${height - 15}" fill="${colors.text}" font-size="12">
        More
    </text>

</svg>
`;
}

module.exports = { renderHeatmapCard };