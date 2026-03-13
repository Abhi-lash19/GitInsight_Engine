const { getTheme } = require("../themes");
const { multiProgressBars } = require("./components");

/**
 * Dashboard content renderer
 */
function renderImpactContent(stats) {
    const themeObj = getTheme();
    const colors = themeObj.colors;

    const data = (stats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 5);

    const progressData = data.map(repo => ({
        label: repo.name.length > 20 ? repo.name.substring(0, 20) + "…" : repo.name,
        value: repo.impactScore
    }));

    return multiProgressBars(progressData, {
        maxBarWidth: 200,
        barColor: colors.title,
        barBgColor: colors.barBg1
    });
}

/**
 * Repo Impact Visualization (clean & readable)
 */
function renderImpactCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const data = (stats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 7);

    const progressData = data.map(repo => ({
        label: repo.name.length > 25 ? repo.name.substring(0, 25) + "…" : repo.name,
        value: repo.impactScore
    }));

    const width = 420;
    const height = 220;

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>
    </defs>

    <!-- Card background -->
    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="${colors.border}" />

    <!-- Title -->
    <text x="24" y="44" fill="${colors.title}" font-size="20" font-weight="600">
        Repo Impact Ranking
    </text>

    <!-- Progress bars -->
    <g transform="translate(24, 80)">
        ${multiProgressBars(progressData, {
        maxBarWidth: 320,
        barColor: colors.title,
        barBgColor: colors.barBg1,
        showPercentage: false
    })}
    </g>

</svg>
`;
}

module.exports = {
    renderImpactCard,
    renderImpactContent
};