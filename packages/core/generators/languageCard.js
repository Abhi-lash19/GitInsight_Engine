const { getTheme } = require("../themes");
const { multiProgressBars, miniLegend } = require("./components");

/**
 * Dashboard language renderer
 */
function renderLanguageContent(languages = {}) {
    const themeObj = getTheme();
    const colors = themeObj.colors;

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

    const sorted = Object.entries(languages || {})
        .map(([k, v]) => ({ label: k, value: parseFloat(v) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const progressData = sorted.map(item => ({
        label: item.label,
        value: item.value
    }));

    const legendData = sorted.map(item => ({
        label: item.label,
        color: languageColors[item.label] || "#8b949e"
    }));

    return `
        ${multiProgressBars(progressData, {
        maxBarWidth: 180,
        theme: themeObj
    })}
        ${miniLegend(legendData, {
        startY: 140,
        theme: themeObj
    })}
    `;
}

/**
 * Generate language bar chart SVG (modern style)
 */
function renderLanguageCard(languages, options = {}) {
    const { theme = "dark" } = options;
    const themeObj = getTheme(theme);
    const colors = themeObj.colors;

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

    const sorted = Object.entries(languages || {})
        .map(([k, v]) => ({ label: k, value: parseFloat(v) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const progressData = sorted.map(item => ({
        label: item.label,
        value: item.value
    }));

    const legendData = sorted.map(item => ({
        label: item.label,
        color: languageColors[item.label] || "#8b949e"
    }));

    const width = 420;
    const height = 200;

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>
    </defs>

    <!-- Card background -->
    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="${colors.border}"/>

    <!-- Title -->
    <text x="24" y="44" fill="${colors.title}" font-size="20" font-weight="600">
        Top Languages
    </text>

    <!-- Progress bars -->
    <g transform="translate(24, 80)">
        ${multiProgressBars(progressData, {
        maxBarWidth: 240,
        barColor: colors.bar1,
        barBgColor: colors.barBg1
    })}
    </g>

    <!-- Legend -->
    <g transform="translate(24, 160)">
        ${miniLegend(legendData, {
        labelColor: colors.subText
    })}
    </g>

</svg>
`;
}

module.exports = {
    renderLanguageCard,
    renderLanguageContent
};
