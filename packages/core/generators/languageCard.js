const { saveSVG } = require("./svgGenerator");
const { getTheme } = require("../themes");

/**
 * Generate language bar chart SVG (modern style)
 */
function generateLanguageCard(username, languages) {
    const theme = getTheme(process.env.CARD_THEME || "dark");
    const colors = theme.colors;

    const languageColors = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        Python: "#3572A5",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Shell: "#89e051",
        EJS: "#a91e50",
        HCL: "#844FBA",
    };

    const barHeight = 16;
    const gap = 14;
    const startY = 80;

    const sorted = Object.entries(languages)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
        .slice(0, 8);

    // ---- Auto width based on longest label ----
    const longestLabel = sorted.reduce(
        (max, [lang]) => Math.max(max, lang.length),
        0
    );

    const labelWidth = longestLabel * 7 + 60;
    const maxWidth = 240;
    const width = labelWidth + maxWidth + 60;

    const bars = sorted
        .map(([lang, percent], index) => {
            const value = parseFloat(percent);
            const barWidth = (value / 100) * maxWidth;
            const y = startY + index * (barHeight + gap);
            const dotColor = languageColors[lang] || "#8b949e";

            return `
        <!-- Language dot -->
        <circle cx="24" cy="${y + 8}" r="5" fill="${dotColor}" />

        <!-- Language label -->
        <text x="36" y="${y + 13}" fill="${colors.text}" font-size="13" font-weight="500">
            ${lang}
        </text>

        <!-- Background bar -->
        <rect x="${labelWidth}" y="${y}" width="${maxWidth}" height="${barHeight}" rx="8" fill="url(#barBg)"/>

        <!-- Animated progress bar -->
        <rect x="${labelWidth}" y="${y}" width="0" height="${barHeight}" rx="8" fill="url(#barGrad)">
            <animate attributeName="width" from="0" to="${barWidth}" dur="0.9s" fill="freeze" />
        </rect>

        <!-- Percentage -->
        <text x="${labelWidth + maxWidth + 8}" y="${y + 13}" fill="${colors.subText}" font-size="12" font-weight="600">
            ${value.toFixed(1)}%
        </text>
        `;
        })
        .join("");

    const height = startY + sorted.length * (barHeight + gap) + 28;

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>

        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${colors.bar1}"/>
            <stop offset="100%" stop-color="${colors.bar2}"/>
        </linearGradient>

        <linearGradient id="barBg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${colors.barBg1}"/>
            <stop offset="100%" stop-color="${colors.barBg2}"/>
        </linearGradient>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
        </filter>
    </defs>

    <!-- Card background -->
    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="${colors.border}" filter="url(#softShadow)"/>

    <!-- Title -->
    <text x="24" y="48" fill="${colors.title}" font-size="20" font-weight="700">
        Top Languages
    </text>

    ${bars}

</svg>
`;

    saveSVG(username, "languages", svg);
}

module.exports = { generateLanguageCard };
