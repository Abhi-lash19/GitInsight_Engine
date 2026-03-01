const { getTheme } = require("../themes");

/**
 * Professional GitHub-style 7x53 heatmap with:
 * - Sunday week start (GitHub accurate)
 * - Percentile-based color scale
 */
function renderHeatmapCard(stats, options = {}) {
    const { theme = "dark", animate = true } = options;
    const { colors } = getTheme(theme);

    // fallback to full year
    const rawData = stats.dailyCommitMatrix || new Array(365).fill(0);

    /**
     * ===== Align to GitHub calendar (weeks start Sunday) =====
     */
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // shift to previous Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const totalDays = 53 * 7;
    const alignedData = new Array(totalDays).fill(0);

    rawData.forEach((v, i) => {
        alignedData[i + (totalDays - rawData.length)] = v;
    });

    const cols = 53;
    const rows = 7;

    const cell = 11;
    const gap = 4;

    const paddingX = 30;
    const paddingTop = 70;

    const width = paddingX * 2 + cols * (cell + gap);
    const height = paddingTop + rows * (cell + gap) + 40;

    /**
     * ===== Percentile color scale =====
     */
    const sorted = [...alignedData].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const max = sorted[sorted.length - 1];

    function getColor(v) {
        if (v === 0) return colors.barBg1 || "#161b22";
        if (v <= p25) return "#0e4429";
        if (v <= p50) return "#006d32";
        if (v <= p75) return "#26a641";
        return "#39d353";
    }

    /**
     * ===== Month labels =====
     */
    const monthLabels = [];
    const dateCursor = new Date(startDate);

    for (let col = 0; col < cols; col++) {
        if (dateCursor.getDate() <= 7) {
            const x = paddingX + col * (cell + gap);
            const label = dateCursor.toLocaleString("default", { month: "short" });

            monthLabels.push(`
                <text x="${x}" y="${paddingTop - 15}" fill="${colors.text}" font-size="11">
                    ${label}
                </text>
            `);
        }
        dateCursor.setDate(dateCursor.getDate() + 7);
    }

    /**
     * ===== Cells =====
     */
    let cells = "";

    alignedData.forEach((value, i) => {
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
                fill="${getColor(value)}"
                opacity="${animate ? 0 : 1}"
            >
                ${animate
                ? `<animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />`
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
        Commit Heatmap
    </text>

    ${monthLabels.join("")}

    ${cells}

    <text x="${paddingX}" y="${height - 15}" fill="${colors.text}" font-size="12">Less</text>
    <text x="${width - 40}" y="${height - 15}" fill="${colors.text}" font-size="12">More</text>

</svg>
`;
}

module.exports = { renderHeatmapCard };