const { saveSVG } = require("./svgGenerator");

/**
 * Generate language bar chart SVG
 */
function generateLanguageCard(username, languages) {
    const width = 400;
    const barHeight = 18;
    const gap = 10;
    const startY = 60;

    const sorted = Object.entries(languages)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
        .slice(0, 8); // top 8 languages

    const maxWidth = 260;

    const bars = sorted
        .map(([lang, percent], index) => {
            const barWidth = (parseFloat(percent) / 100) * maxWidth;
            const y = startY + index * (barHeight + gap);

            return `
        <text x="20" y="${y + 14}" fill="#c9d1d9" font-size="14">${lang}</text>

        <rect x="120" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#58a6ff"/>

        <text x="${130 + barWidth}" y="${y + 14}" fill="#8b949e" font-size="12">
            ${percent}%
        </text>
        `;
        })
        .join("");

    const height = startY + sorted.length * (barHeight + gap) + 20;

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" rx="14" fill="#0d1117"/>

    <text x="20" y="36" fill="#58a6ff" font-size="20" font-weight="bold">
        Top Languages
    </text>

    ${bars}
</svg>
`;

    saveSVG(username, "languages", svg);
}

module.exports = { generateLanguageCard };
