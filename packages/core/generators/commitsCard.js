const { createCard } = require("./svgGenerator");
const { multiProgressBars } = require("./components");

/**
 * Dashboard renderer
 */
function renderCommitsContent(stats) {
    const commits = stats.commitsPerRepo || {};
    const sorted = Object.entries(commits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const progressData = sorted.map(([repo, count]) => ({
        label: repo.length > 20 ? repo.substring(0, 20) + "…" : repo,
        value: count
    }));

    return multiProgressBars(progressData, {
        maxBarWidth: 200,
        barColor: "#58a6ff",
        barBgColor: "#30363d"
    });
}

/**
 * Standalone card
 */
function renderCommitsCard(stats, options = {}) {
    const { theme = "dark" } = options;

    const commits = stats.commitsPerRepo || {};
    const sorted = Object.entries(commits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const progressData = sorted.map(([repo, count]) => ({
        label: repo.length > 25 ? repo.substring(0, 25) + "…" : repo,
        value: count
    }));

    const width = 420;
    const height = 200;

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0d1117"/>
            <stop offset="100%" stop-color="#161b22"/>
        </linearGradient>
    </defs>

    <!-- Card background -->
    <rect width="100%" height="100%" rx="16" fill="url(#cardBg)" stroke="#30363d"/>

    <!-- Title -->
    <text x="24" y="44" fill="#58a6ff" font-size="20" font-weight="600">
        Commits Distribution
    </text>

    <!-- Progress bars -->
    <g transform="translate(24, 80)">
        ${multiProgressBars(progressData, {
        maxBarWidth: 320,
        barColor: "#58a6ff",
        barBgColor: "#30363d"
    })}
    </g>

</svg>
`;
}

module.exports = {
    renderCommitsCard,
    renderCommitsContent
};