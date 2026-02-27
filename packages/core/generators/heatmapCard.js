const { getTheme } = require("../themes");

/**
 * Professional GitHub-style 7x52 heatmap
 */
function renderHeatmapCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const data = stats.dailyCommitMatrix || new Array(365).fill(0);

    const cols = 53;
    const rows = 7;

    const cell = 11;
    const gap = 4;

    const paddingX = 30;
    const paddingTop = 70;

    const width = paddingX * 2 + cols * (cell + gap);
    const height = paddingTop + rows * (cell + gap) + 40;

    const max = Math.max(...data, 1);

    const colorScale = v => {
        if (v === 0) return "#161b22";
        const r = v / max;
        if (r < 0.25) return "#0e4429";
        if (r < 0.5) return "#006d32";
        if (r < 0.75) return "#26a641";
        return "#39d353";
    };

    let cells = "";

    data.forEach((value, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;

        const x = paddingX + col * (cell + gap);
        const y = paddingTop + row * (cell + gap);

        cells += `
                <rect
                    x="${x}"
                    y="${y}"
                    width="${cell}"
                    height="${cell}"
                    rx="2"
                    fill="${colorScale(value)}"
                />
            `;
    });

    return `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
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