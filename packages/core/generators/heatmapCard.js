const { getTheme } = require("../themes");

/**
 * Dashboard heatmap renderer
 */
function renderHeatmapContent(stats, options = {}) {

    const grid = renderHeatmapGrid(stats, options);

    return `
<g transform="translate(0,0)">
${grid}
</g>
`;
}

/**
 * Internal grid renderer
 */
function renderHeatmapGrid(stats, options = {}) {

    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const rawData =
        stats.dailyCommitMatrix ||
        stats.dailyCommitMap ||
        new Array(365).fill(0);

    const cols = 53;
    const rows = 7;

    /**
     * Smaller cells for dashboard
     */
    const cell = 6;
    const gap = 2;

    const totalDays = cols * rows;
    const aligned = new Array(totalDays).fill(0);

    rawData.forEach((v, i) => {
        aligned[i + (totalDays - rawData.length)] = v;
    });

    const sorted = [...aligned].sort((a, b) => a - b);

    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];

    function getColor(v) {
        if (v === 0) return colors.barBg1 || "#161b22";
        if (v <= p25) return "#0e4429";
        if (v <= p50) return "#006d32";
        if (v <= p75) return "#26a641";
        return "#39d353";
    }

    let cells = "";

    aligned.forEach((value, i) => {

        const col = Math.floor(i / 7);
        const row = i % 7;

        const x = col * (cell + gap);
        const y = row * (cell + gap);

        cells += `
<rect
x="${x}"
y="${y}"
width="${cell}"
height="${cell}"
rx="1"
fill="${getColor(value)}"
/>`;
    });

    return cells;
}

/**
 * Standalone heatmap card
 */
function renderHeatmapCard(stats, options = {}) {

    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const grid = renderHeatmapGrid(stats, options);

    return `
<svg viewBox="0 0 420 120" width="100%" xmlns="http://www.w3.org/2000/svg">

<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${colors.bgStart}" />
<stop offset="100%" stop-color="${colors.bgEnd}" />
</linearGradient>
</defs>

<rect width="100%" height="100%" rx="16" fill="url(#bg)" stroke="${colors.border}" />

<text x="20" y="30" fill="${colors.title}" font-size="18" font-weight="600">
🔥 Commit Heatmap
</text>

<g transform="translate(20,45)">
${grid}
</g>

</svg>
`;
}

module.exports = {
    renderHeatmapCard,
    renderHeatmapGrid,
    renderHeatmapContent
};