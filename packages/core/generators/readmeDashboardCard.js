const { getTheme } = require("../themes");
const { renderHeatmapCard } = require("./heatmapCard");


/**
 * Generate a single dashboard SVG for README
 */
function renderReadmeDashboard(stats, options = {}) {

    const { theme = "dark" } = options;

    const { colors } = getTheme(theme);

    const width = 900;
    const height = 900;

    const padding = 32;
    const columnGap = 36;
    const cardWidth = 390;
    const cardPadding = 20;

    const leftX = padding;
    const rightX = padding + cardWidth + columnGap;

    /** layout rows */
    const row1Y = 70;
    const row2Y = 240;
    const row3Y = 410;
    const row4Y = 760;

    const smallCardHeight = 140;

    const heatmapHeight = 220;
    // FIX: increased heatmap height so grid does not get clipped

    let safeStats = stats;

    if (stats?.stats) safeStats = stats.stats;
    if (stats?.data) safeStats = stats.data;
    if (stats?.data?.data) safeStats = stats.data.data;

    const insights = safeStats.insights || {};
    const codeStats = safeStats.codeStats || {};
    const traffic = safeStats.traffic || {};

    // Safe stats fallback
    const totalRepos = safeStats.totalRepos ?? 0;
    const totalStars = safeStats.totalStars ?? 0;
    const totalForks = safeStats.totalForks ?? 0;
    const totalContributions = safeStats.totalContributions ?? 0;
    const totalCommits = safeStats.totalCommits ?? 0;

    const topRepo = safeStats.topRepo?.name || "N/A";

    const languages = Object.entries(safeStats.languages || {})
        .map(([k, v]) => [k, parseFloat(v)])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const repoImpact = (safeStats.repoImpact || [])
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 5);

    const commitTrend = safeStats.weeklyCommitTrend || [];

    const commitsPerRepo = Object.entries(safeStats.commitsPerRepo || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    /**
     * Language bars
     */
    const languageRows = languages.map((l, i) => {

        const [name, percent] = l;

        const y = row3Y + heatmapHeight + 90 + i * 22;
        // FIX: moved rows down to avoid title overlap

        const labelWidth = 90;
        const barWidth = 160;
        const bar = (percent / 100) * barWidth;

        return `
<text x="${rightX + cardPadding}" y="${y}" fill="${colors.text}" font-size="13">${name}</text>

<rect x="${rightX + cardPadding + labelWidth}" y="${y - 10}"
width="${barWidth}" height="10" rx="5" fill="${colors.barBg1 || "#222"}"/>

<rect x="${rightX + cardPadding + labelWidth}" y="${y - 10}"
width="${bar}" height="10" rx="5" fill="${colors.accent || colors.title}"/>

<text x="${rightX + cardPadding + labelWidth + barWidth + 6}"
y="${y}" fill="${colors.text}" font-size="12">
${percent.toFixed(1)}%
</text>
`;
    }).join("");

    /**
     * Repo impact bars
     */
    const maxImpact = Math.max(...repoImpact.map(r => r.impactScore), 1);

    const impactRows = repoImpact.map((r, i) => {

        const y = row3Y + heatmapHeight + 90 + i * 22;
        // FIX: same spacing fix as languages

        const barWidth = (r.impactScore / maxImpact) * 160;

        return `
<text x="${leftX + cardPadding}" y="${y}" fill="${colors.text}" font-size="13">
${r.name}
</text>

<rect x="${leftX + 200}" y="${y - 10}" width="160" height="10"
rx="5" fill="${colors.barBg1}"/>

<rect x="${leftX + 200}" y="${y - 10}" width="${barWidth}"
height="10" rx="5" fill="${colors.title}"/>
`;
    }).join("");

    /**
     * Commit activity sparkline
     */
    const maxTrend = Math.max(...commitTrend, 1);

    const trendPath = commitTrend.map((v, i) => {

        const x = rightX + cardPadding + i * 6;

        const y = row4Y + 120 - (v / maxTrend) * 60;
        // FIX: moved graph baseline lower so it sits correctly inside card

        return `${i === 0 ? "M" : "L"} ${x} ${y}`;

    }).join(" ");

    /**
     * Top repositories
     */
    const repoRows = commitsPerRepo.map((r, i) => {

        const y = row4Y + 60 + i * 18;

        return `
<text x="${leftX + cardPadding}" y="${y}" fill="${colors.text}" font-size="13">
${r[0]} — ${r[1]} commits
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

<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
<feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.25"/>
</filter>

</defs>

<rect
width="100%"
height="100%"
rx="20"
fill="url(#bg)"
stroke="${colors.border}"
filter="url(#shadow)"
/>

<text
x="${padding}"
y="48"
fill="${colors.title}"
font-size="26"
font-weight="700"
>
GitInsight Profile
</text>


<!-- OVERVIEW -->

<rect
x="${leftX}"
y="${row1Y}"
width="${cardWidth}"
height="${smallCardHeight}"
rx="14"
fill="${colors.cardBg || "#00000020"}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="${row1Y + 30}" fill="${colors.title}" font-size="17" font-weight="600">
Overview
</text>

<text x="${leftX + cardPadding}" y="${row1Y + 60}" fill="${colors.text}" font-size="14">
📦 Repositories: ${totalRepos}
</text>

<text x="${leftX + cardPadding}" y="${row1Y + 80}" fill="${colors.text}" font-size="14">
⭐ Stars: ${totalStars}
</text>

<text x="${leftX + cardPadding}" y="${row1Y + 100}" fill="${colors.text}" font-size="14">
🍴 Forks: ${totalForks}
</text>

<text x="${leftX + cardPadding}" y="${row1Y + 120}" fill="${colors.text}" font-size="14">
🔥 Contributions: ${totalContributions}
</text>


<!-- Code activity -->

<rect
x="${rightX}"
y="${row1Y}"
width="${cardWidth}"
height="${smallCardHeight}"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${rightX + cardPadding}" y="${row1Y + 30}"
fill="${colors.title}" font-size="17" font-weight="600">
Code Activity
</text>

<text x="${rightX + cardPadding}" y="${row1Y + 60}" fill="${colors.text}" font-size="14">
Lines Added: ${codeStats.totalLinesAdded ?? 0}
</text>

<text x="${rightX + cardPadding}" y="${row1Y + 80}" fill="${colors.text}" font-size="14">
Lines Deleted: ${codeStats.totalLinesDeleted ?? 0}
</text>

<text x="${rightX + cardPadding}" y="${row1Y + 100}" fill="${colors.text}" font-size="14">
Net Lines: ${codeStats.netLines ?? 0}
</text>


<!-- Developer Insights -->

<rect
x="${leftX}"
y="${row2Y}"
width="${cardWidth}"
height="${smallCardHeight}"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="${row2Y + 30}"
fill="${colors.title}" font-size="17" font-weight="600">
Developer Insights
</text>

<text x="${leftX + cardPadding}" y="${row2Y + 60}" fill="${colors.text}" font-size="14">
Top Repo: ${topRepo}
</text>

<text x="${leftX + cardPadding}" y="${row2Y + 80}" fill="${colors.text}" font-size="14">
Total Commits: ${totalCommits}
</text>

<text x="${leftX + cardPadding}" y="${row2Y + 100}" fill="${colors.text}" font-size="14">
Total Stars: ${totalStars}
</text>

<text x="${leftX + cardPadding}" y="${row2Y + 120}" fill="${colors.text}" font-size="14">
Total Forks: ${totalForks}
</text>


<!-- Traffic -->

<rect
x="${rightX}"
y="${row2Y}"
width="${cardWidth}"
height="${smallCardHeight}"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${rightX + cardPadding}" y="${row2Y + 30}"
fill="${colors.title}" font-size="17" font-weight="600">
Traffic Analytics
</text>

<text x="${rightX + cardPadding}" y="${row2Y + 60}" fill="${colors.text}" font-size="14">
Views: ${traffic.totalViews ?? 0}
</text>

<text x="${rightX + cardPadding}" y="${row2Y + 80}" fill="${colors.text}" font-size="14">
Visitors: ${traffic.totalUniqueVisitors ?? 0}
</text>


<!-- Contribution Heatmap -->

${renderHeatmapCard(safeStats, { theme })}
<!-- FIX: real heatmap injected instead of placeholder box -->


<!-- Repo Impact -->

<rect
x="${leftX}"
y="${row3Y + heatmapHeight + 30}"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="${row3Y + heatmapHeight + 60}"
fill="${colors.title}" font-size="17" font-weight="600">
Repo Impact
</text>

${impactRows}


<!-- Languages -->

<rect
x="${rightX}"
y="${row3Y + heatmapHeight + 30}"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${rightX + cardPadding}" y="${row3Y + heatmapHeight + 60}"
fill="${colors.title}" font-size="17" font-weight="600">
Languages
</text>

${languageRows}


<!-- Top Repositories -->

<rect
x="${leftX}"
y="${row4Y}"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="${row4Y + 30}"
fill="${colors.title}" font-size="17" font-weight="600">
Top Repositories
</text>

${repoRows}


<!-- Commit activity -->

<rect
x="${rightX}"
y="${row4Y}"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg}"
stroke="${colors.border}"
/>

<text x="${rightX + cardPadding}" y="${row4Y + 30}"
fill="${colors.title}" font-size="17" font-weight="600">
Commit Activity
</text>

<path d="${trendPath}"
stroke="${colors.title}" fill="none" stroke-width="2"/>

</svg>
`;
}

module.exports = { renderReadmeDashboard };