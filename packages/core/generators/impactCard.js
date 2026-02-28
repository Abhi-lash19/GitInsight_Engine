const { getTheme } = require("../themes");

/**
 * Repo Impact Visualization (clean & readable)
 */
function renderImpactCard(stats, options = {}) {
    const { theme = "dark", animate = true } = options;
    const { colors } = getTheme(theme);

    const data = (stats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 7);

    const width = 460;
    const barHeight = 22;
    const gap = 18;
    const startY = 70;

    /**
     * ===== Dynamic padding based on longest repo name =====
     * Approx 7px per character (SVG font avg)
     */
    const longestNameLength = data.reduce(
        (max, d) => Math.max(max, (d.name || "").length),
        0
    );

    const labelWidth = longestNameLength * 7 + 40; // dynamic label area
    const leftPadding = labelWidth;
    const rightPadding = 40;
    const chartWidth = width - leftPadding - rightPadding;

    const max = Math.max(...data.map(d => d.impactScore), 1);

    const rows = data.map((d, i) => {
        const y = startY + i * (barHeight + gap);
        const barWidth = (d.impactScore / max) * chartWidth;

        return `
            <text x="24" y="${y + 16}" fill="${colors.text}" font-size="13">
                ${d.name}
            </text>

            <!-- Background bar -->
            <rect
                x="${leftPadding}"
                y="${y}"
                width="${chartWidth}"
                height="${barHeight}"
                rx="8"
                fill="${colors.barBg1}"
            />

            <!-- Progress bar -->
            ${animate
                ? `<rect x="${leftPadding}" y="${y}" width="0" height="${barHeight}" rx="8" fill="${colors.title}">
                        <animate attributeName="width" from="0" to="${barWidth}" dur="0.8s" fill="freeze" />
                       </rect>`
                : `<rect x="${leftPadding}" y="${y}" width="${barWidth}" height="${barHeight}" rx="8" fill="${colors.title}" />`
            }

            <!-- Score -->
            <text
                x="${leftPadding + chartWidth - 6}"
                y="${y + 16}"
                fill="${colors.text}"
                font-size="12"
                text-anchor="end"
            >
                ${d.impactScore.toFixed(1)}
            </text>
        `;
    }).join("");

    const height = startY + data.length * (barHeight + gap) + 40;

    return `
<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="${colors.border}" />

    <text x="24" y="38" fill="${colors.title}" font-size="20" font-weight="600">
        Repo Impact Ranking
    </text>

    ${rows}

</svg>
`;
}

module.exports = { renderImpactCard };