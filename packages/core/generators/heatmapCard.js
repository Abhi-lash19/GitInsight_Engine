const { getTheme } = require("../themes");

/**
 * Professional GitHub-style 7x52 heatmap with month labels
 */
function renderHeatmapCard(stats, options = {}) {
    const { theme = "dark", animate = true } = options;
    const themeObj = getTheme(theme);
    const { colors } = themeObj;

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


    function getGithubGreen(value) {
        if (value === 0) return colors.barBg1 || "#161b22";

        const ratio = value / max;

        if (ratio < 0.25) return "#0e4429";
        if (ratio < 0.5) return "#006d32";
        if (ratio < 0.75) return "#26a641";
        return "#39d353";
    };

    /**
     * ===== Month labels calculation =====
     */
    const monthLabels = [];
    const now = new Date();

    for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (364 - i));

        if (d.getDate() === 1) {
            const col = Math.floor(i / 7);
            const x = paddingX + col * (cell + gap);

            const label = d.toLocaleString("default", { month: "short" });

            monthLabels.push(`
                <text x="${x}" y="${paddingTop - 15}" fill="${colors.text}" font-size="11">
                    ${label}
                </text>
            `);
        }
    }

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
                    fill="${getGithubGreen(value)}"
                    opacity="${animate ? 0 : 1}"
                >
                    ${animate
                ? `<animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze" />`
                : ""
            }
                </rect>
            `;
    });

    return `
<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">

    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="${colors.border}" />

    <text x="${paddingX}" y="35" fill="${colors.title}" font-size="20" font-weight="600">
        52-Week Commit Heatmap
    </text>

    ${monthLabels.join("")}

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