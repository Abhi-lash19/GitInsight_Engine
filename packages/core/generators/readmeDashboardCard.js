const { getTheme } = require("../themes");

/**
 * Generate a single dashboard SVG for README
 */
function renderReadmeDashboard(stats, options = {}) {
    const { theme = "dark" } = options;

    const themeConfig = getTheme(theme);
    const { colors } = themeConfig;

    const width = 760;
    const height = 380;

    /**
     * Normalize all possible stats shapes
     */
    let safeStats = stats;

    if (stats?.stats) {
        safeStats = stats.stats;
    }

    if (stats?.data) {
        safeStats = stats.data;
    }

    if (stats?.data?.data) {
        safeStats = stats.data.data;
    }

    const insights = safeStats.insights || {};
    const codeStats = safeStats.codeStats || {};

    // Safe stats fallback
    const totalRepos = safeStats.totalRepos ?? 0;
    const totalStars = safeStats.totalStars ?? 0;
    const totalContributions = safeStats.totalContributions ?? 0;
    const totalCommits = safeStats.totalCommits ?? insights.totalCommits ?? 0;

    // Normalize languages (values come as strings)
    const languages = Object.entries(safeStats.languages || {})
        .map(([name, value]) => [name, parseFloat(value)])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxBar = 180;

    const languageRows = languages.map((l, i) => {
        const [name, percent] = l;

        const barWidth = (percent / 100) * maxBar;

        return `
        <text x="40" y="${210 + i * 26}" fill="${colors.text}" font-size="14">
            ${name}
        </text>

        <rect x="170" y="${198 + i * 26}" width="${maxBar}" height="10"
            rx="5"
            fill="${colors.barBg1 || "#222"}" />

        <rect x="170" y="${198 + i * 26}" width="${barWidth}" height="10"
            rx="5"
            fill="${colors.accent || colors.title}" />

        <text x="${180 + maxBar}" y="${210 + i * 26}"
            fill="${colors.text}"
            font-size="13"
            text-anchor="end">
            ${percent.toFixed(1)}%
        </text>
        `;
    }).join("");

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg">

    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}" />
            <stop offset="100%" stop-color="${colors.bgEnd}" />
        </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="20"
        fill="url(#bg)"
        stroke="${colors.border}" />

    <text x="40" y="50"
        fill="${colors.title}"
        font-size="26"
        font-weight="700">
        GitInsight Dashboard
    </text>

    <!-- Overview -->
    <text x="40" y="100" fill="${colors.text}" font-size="15">
        📦 Repositories: ${totalRepos}
    </text>

    <text x="40" y="125" fill="${colors.text}" font-size="15">
        ⭐ Stars: ${totalStars}
    </text>

    <text x="40" y="150" fill="${colors.text}" font-size="15">
        🔥 Contributions: ${totalContributions}
    </text>

    <text x="40" y="175" fill="${colors.text}" font-size="15">
        📝 Commits: ${totalCommits}
    </text>

    <!-- Languages -->
    <text x="40" y="190"
        fill="${colors.title}"
        font-size="18"
        font-weight="600">
        Top Languages
    </text>

    ${languageRows}

    <!-- Code Stats -->
    <text x="430" y="100"
        fill="${colors.title}"
        font-size="18"
        font-weight="600">
        Code Activity
    </text>

    <text x="430" y="130" fill="${colors.text}" font-size="14">
        Lines Added: ${codeStats.totalLinesAdded ?? 0}
    </text>

    <text x="430" y="155" fill="${colors.text}" font-size="14">
        Lines Deleted: ${codeStats.totalLinesDeleted ?? 0}
    </text>

    <text x="430" y="180" fill="${colors.text}" font-size="14">
        Net Lines: ${codeStats.netLines ?? 0}
    </text>

    <text x="430" y="220"
        fill="${colors.title}"
        font-size="18"
        font-weight="600">
        Productivity
    </text>

    <text x="430" y="250" fill="${colors.text}" font-size="14">
        Score: ${insights.productivityScore ?? 0}
    </text>

    <text x="430" y="275" fill="${colors.text}" font-size="14">
        Activity: ${insights.activityLevel ?? "N/A"}
    </text>

</svg>
`;
}

module.exports = { renderReadmeDashboard };