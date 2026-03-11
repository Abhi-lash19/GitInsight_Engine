const { getTheme } = require("../themes");
const { renderHeatmapGrid } = require("./heatmapCard");
const { renderCard } = require("./cardRenderer");

/**
 * Generate README dashboard SVG
 */
function renderReadmeDashboard(stats, options = {}) {

    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const width = 900;
    const height = 1050;

    const padding = 32;
    const columnGap = 36;
    const cardWidth = 390;

    const leftX = padding;
    const rightX = padding + cardWidth + columnGap;

    /**
     * Fixed row layout (prevents layout engine misplacement)
     */
    const row1Y = 70;
    const row2Y = row1Y + 160;
    const row3Y = row2Y + 160;
    const row4Y = row3Y + 300;
    const row5Y = row4Y + 180;

    /** Card positions */
    const overviewCard = { x: leftX, y: row1Y, width: cardWidth, height: 140 };
    const insightsCard = { x: rightX, y: row1Y, width: cardWidth, height: 140 };

    const codeCard = { x: leftX, y: row2Y, width: cardWidth, height: 140 };
    const trafficCard = { x: rightX, y: row2Y, width: cardWidth, height: 140 };

    const heatmapCard = {
        x: leftX,
        y: row3Y,
        width: cardWidth * 2 + columnGap,
        height: 260
    };

    const languagesCard = { x: leftX, y: row4Y, width: cardWidth, height: 150 };
    const reposCard = { x: rightX, y: row4Y, width: cardWidth, height: 150 };

    const impactCard = { x: leftX, y: row5Y, width: cardWidth, height: 150 };
    const commitsCard = { x: rightX, y: row5Y, width: cardWidth, height: 150 };

    const safeStats = stats?.stats || stats?.data || stats || {};

    const codeStats = safeStats.codeStats || {};
    const traffic = safeStats.traffic || {};
    const insights = safeStats.insights || {};

    const totalRepos = safeStats.totalRepos ?? 0;
    const totalStars = safeStats.totalStars ?? 0;
    const totalForks = safeStats.totalForks ?? 0;
    const totalContributions = safeStats.totalContributions ?? 0;
    const totalCommits = safeStats.totalCommits ?? 0;

    const topRepo = safeStats.topRepo?.name || "N/A";

    /**
     * Card inner layout constants
     */
    const innerPadding = 20;
    const labelWidth = 120;
    const barMaxWidth = cardWidth - labelWidth - innerPadding - 40;

    /**
     * Languages
     */
    const languageIcons = {
        JavaScript: "🟨",
        TypeScript: "🔷",
        Python: "🐍",
        Java: "☕",
        Go: "🐹",
        Rust: "🦀",
        HTML: "🌐",
        CSS: "🎨",
        Shell: "🐚",
        C: "💻",
        "C++": "⚙️"
    };

    const languages = Object.entries(safeStats.languages || {})
        .map(([k, v]) => [k, parseFloat(v)])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const languageRows = languages.map(([name, percent], i) => {

        const y = 60 + i * 24;
        const icon = languageIcons[name] || "🧩";

        const bar = (percent / 100) * barMaxWidth;

        return `
<text x="${innerPadding}" y="${y}" fill="${colors.text}" font-size="13">
${icon} ${name}
</text>

<rect
x="${labelWidth}"
y="${y - 10}"
width="${barMaxWidth}"
height="10"
rx="5"
fill="${colors.barBg1}" />

<rect
x="${labelWidth}"
y="${y - 10}"
width="${bar}"
height="10"
rx="5"
fill="${colors.title}" />

<text
x="${labelWidth + barMaxWidth + 6}"
y="${y}"
fill="${colors.text}"
font-size="12">
${percent.toFixed(1)}%
</text>
`;
    }).join("");

    /**
     * Repo Impact
     */
    const repoImpact = (safeStats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 5);

    const maxImpact = Math.max(...repoImpact.map(r => r.impactScore), 1);

    const impactRows = repoImpact.map((r, i) => {

        const y = 60 + i * 24;
        const bar = (r.impactScore / maxImpact) * barMaxWidth;

        const repoName =
            r.name.length > 18
                ? r.name.substring(0, 18) + "…"
                : r.name;

        return `
<text x="${innerPadding}" y="${y}" fill="${colors.text}" font-size="13">
📦 ${repoName}
</text>

<rect
x="${labelWidth}"
y="${y - 10}"
width="${barMaxWidth}"
height="10"
rx="5"
fill="${colors.barBg1}" />

<rect
x="${labelWidth}"
y="${y - 10}"
width="${bar}"
height="10"
rx="5"
fill="${colors.title}" />
`;
    }).join("");

    /**
     * Commit Sparkline
     */
    const commitTrend = safeStats.weeklyCommitTrend || [];
    const maxTrend = Math.max(...commitTrend, 1);

    const step = (cardWidth - innerPadding * 2) / Math.max(commitTrend.length, 1);

    const trendPath = commitTrend.map((v, i) => {

        const x = innerPadding + i * step;
        const y = commitsCard.height - 20 - (v / maxTrend) * 60;

        return `${i === 0 ? "M" : "L"} ${x} ${y}`;

    }).join(" ");

    /**
     * Top repos
     */
    const commitsPerRepo = Object.entries(safeStats.commitsPerRepo || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const repoRows = commitsPerRepo.map(([name, count], i) => {

        const y = 60 + i * 20;

        const repoName =
            name.length > 22
                ? name.substring(0, 22) + "…"
                : name;

        return `
<text x="${innerPadding}" y="${y}" fill="${colors.text}" font-size="13">
📦 ${repoName} — ${count}
</text>
`;
    }).join("");

    /**
     * dynamic heatmap scale
     */
    const heatmapWidth = 53 * (9 + 3);
    const heatmapScale = (heatmapCard.width - 80) / heatmapWidth;

    /**
     * SVG
     */
    return `
<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">

<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${colors.bgStart}" />
<stop offset="100%" stop-color="${colors.bgEnd}" />
</linearGradient>
</defs>

<rect width="100%" height="100%" rx="20" fill="url(#bg)" stroke="${colors.border}" />

<text x="${padding}" y="48" fill="${colors.title}" font-size="26" font-weight="700">
🚀 GitInsight Profile
</text>

${renderCard({
        ...overviewCard,
        title: "📊 Overview",
        colors,
        content: `
<text x="20" y="60" fill="${colors.text}">📦 Repositories: ${totalRepos}</text>
<text x="20" y="80" fill="${colors.text}">⭐ Stars: ${totalStars}</text>
<text x="20" y="100" fill="${colors.text}">🍴 Forks: ${totalForks}</text>
<text x="20" y="120" fill="${colors.text}">🔥 Contributions: ${totalContributions}</text>
`
    })}

${renderCard({
        ...insightsCard,
        title: "🧠 Developer Insights",
        colors,
        content: `
<text x="20" y="60" fill="${colors.text}">🏆 Top Repo: ${topRepo}</text>
<text x="20" y="80" fill="${colors.text}">📊 Total Commits: ${totalCommits}</text>
<text x="20" y="100" fill="${colors.text}">⚡ Productivity Score: ${insights.productivityScore ?? 0}</text>
`
    })}

${renderCard({
        ...codeCard,
        title: "💻 Code Activity",
        colors,
        content: `
<text x="20" y="60" fill="${colors.text}">➕ Lines Added: ${codeStats.totalLinesAdded ?? 0}</text>
<text x="20" y="80" fill="${colors.text}">➖ Lines Deleted: ${codeStats.totalLinesDeleted ?? 0}</text>
<text x="20" y="100" fill="${colors.text}">📈 Net Lines: ${codeStats.netLines ?? 0}</text>
`
    })}

${renderCard({
        ...trafficCard,
        title: "🌐 Traffic Analytics",
        colors,
        content: `
<text x="20" y="60" fill="${colors.text}">👀 Views: ${traffic.totalViews ?? 0}</text>
<text x="20" y="80" fill="${colors.text}">🧑 Visitors: ${traffic.totalUniqueVisitors ?? 0}</text>
`
    })}

${renderCard({
        ...heatmapCard,
        title: "🔥 Contribution Heatmap",
        colors,
        content: `
<g transform="translate(40,60) scale(${heatmapScale})">
${renderHeatmapGrid(safeStats, { theme })}
</g>
`
    })}

${renderCard({
        ...languagesCard,
        title: "🧩 Languages",
        colors,
        content: languageRows
    })}

${renderCard({
        ...reposCard,
        title: "📦 Top Repositories",
        colors,
        content: repoRows
    })}

${renderCard({
        ...impactCard,
        title: "📊 Repo Impact",
        colors,
        content: impactRows
    })}

${renderCard({
        ...commitsCard,
        title: "📈 Commit Activity",
        colors,
        content: `<path d="${trendPath}" stroke="${colors.title}" fill="none" stroke-width="2"/>`
    })}

</svg>
`;
}

module.exports = { renderReadmeDashboard };