const { getTheme } = require("../themes");

/**
 * Repo Impact Visualization (clean & readable)
 */
function renderImpactCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const data = (stats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 5);

    const width = 460;
    const barHeight = 22;
    const gap = 18;
    const startY = 70;
    const leftPadding = 140;
    const chartWidth = 260;

    const max = Math.max(...data.map(d => d.impactScore), 1);

    const rows = data.map((d, i) => {
        const y = startY + i * (barHeight + gap);
        const barWidth = (d.impactScore / max) * chartWidth;

        return `
            <text x="24" y="${y + 16}" fill="${colors.text}" font-size="13">
                ${d.name}
            </text>

            <rect
                x="${leftPadding}"
                y="${y}"
                width="${barWidth}"
                height="${barHeight}"
                rx="8"
                fill="${colors.title}"
            />

            <text
                x="${leftPadding + barWidth + 8}"
                y="${y + 16}"
                fill="${colors.text}"
                font-size="12"
            >
                ${d.impactScore.toFixed(1)}
            </text>
        `;
    }).join("");

    const height = startY + data.length * (barHeight + gap) + 30;

    return `
<svg 
    width="100%" 
    viewBox="0 0 ${width} ${height}" 
    height="${height}" 
    xmlns="http://www.w3.org/2000/svg"
>

    <rect width="100%" height="100%" rx="16" fill="${colors.bgStart}" stroke="${colors.border}" />

    <text x="24" y="38" fill="${colors.title}" font-size="20" font-weight="600">
        Repo Impact Ranking
    </text>

    ${rows}

</svg>
`;
}

module.exports = { renderImpactCard };