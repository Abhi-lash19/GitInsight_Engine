const { getTheme } = require("../themes");

/**
 * Generate a single dashboard SVG for README
 */
function renderReadmeDashboard(stats, options = {}) {

    const { theme = "dark" } = options;

    const { colors } = getTheme(theme);

    const width = 820;
    const height = 440;

    const padding = 32;
    const columnGap = 36;

    const cardWidth = 360;

    const leftX = padding;
    const rightX = padding + cardWidth + columnGap;

    const cardPadding = 20;

    let safeStats = stats;

    if (stats?.stats) safeStats = stats.stats;
    if (stats?.data) safeStats = stats.data;
    if (stats?.data?.data) safeStats = stats.data.data;

    const insights = safeStats.insights || {};
    const codeStats = safeStats.codeStats || {};

    // Safe stats fallback
    const totalRepos = safeStats.totalRepos ?? 0;
    const totalStars = safeStats.totalStars ?? 0;
    const totalForks = safeStats.totalForks ?? 0;
    const totalContributions = safeStats.totalContributions ?? 0;
    const totalCommits = safeStats.totalCommits ?? insights.totalCommits ?? 0;

    const topRepo = safeStats.topRepo?.name || "N/A";

    const languages = Object.entries(safeStats.languages || {})
        .map(([k, v]) => [k, parseFloat(v)])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    /**
     * Layout constants
     */
    const labelWidth = 90;
    const barWidth = 160;

    const languageRows = languages.map((l, i) => {

        const [name, percent] = l;

        const y = 260 + i * 22;

        const bar = (percent / 100) * barWidth;

        return `

<text
x="${rightX + cardPadding}"
y="${y}"
fill="${colors.text}"
font-size="13"
>
${name}
</text>

<rect
x="${rightX + cardPadding + labelWidth}"
y="${y - 10}"
width="${barWidth}"
height="10"
rx="5"
fill="${colors.barBg1 || "#222"}"
/>

<rect
x="${rightX + cardPadding + labelWidth}"
y="${y - 10}"
width="${bar}"
height="10"
rx="5"
fill="${colors.accent || colors.title}"
/>

<text
x="${rightX + cardPadding + labelWidth + barWidth + 6}"
y="${y}"
fill="${colors.text}"
font-size="12"
>
${percent.toFixed(1)}%
</text>

`;

    }).join("");

    return `

<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

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
font-size="24"
font-weight="700"
>
GitInsight Profile
</text>


<!-- OVERVIEW -->

<rect
x="${leftX}"
y="70"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg || "#00000020"}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="100" fill="${colors.title}" font-size="17" font-weight="600">
Overview
</text>

<text x="${leftX + cardPadding}" y="130" fill="${colors.text}" font-size="14">
📦 Repositories: ${totalRepos}
</text>

<text x="${leftX + cardPadding}" y="152" fill="${colors.text}" font-size="14">
⭐ Stars: ${totalStars}
</text>

<text x="${leftX + cardPadding}" y="174" fill="${colors.text}" font-size="14">
🍴 Forks: ${totalForks}
</text>

<text x="${leftX + cardPadding}" y="196" fill="${colors.text}" font-size="14">
🔥 Contributions: ${totalContributions}
</text>


<!-- INSIGHTS -->

<rect
x="${leftX}"
y="240"
width="${cardWidth}"
height="150"
rx="14"
fill="${colors.cardBg || "#00000020"}"
stroke="${colors.border}"
/>

<text x="${leftX + cardPadding}" y="270" fill="${colors.title}" font-size="17" font-weight="600">
Developer Insights
</text>

<text x="${leftX + cardPadding}" y="300" fill="${colors.text}" font-size="14">
⚡ Productivity Score: ${insights.productivityScore ?? 0}
</text>

<text x="${leftX + cardPadding}" y="322" fill="${colors.text}" font-size="14">
📈 Activity Level: ${insights.activityLevel ?? "N/A"}
</text>

<text x="${leftX + cardPadding}" y="344" fill="${colors.text}" font-size="14">
📝 Commits: ${totalCommits}
</text>

<text x="${leftX + cardPadding}" y="366" fill="${colors.text}" font-size="14">
🚀 Top Repo: ${topRepo}
</text>


<!-- CODE -->

<rect
x="${rightX}"
y="70"
width="${cardWidth}"
height="120"
rx="14"
fill="${colors.cardBg || "#00000020"}"
stroke="${colors.border}"
/>

<text x="${rightX + cardPadding}" y="100" fill="${colors.title}" font-size="17" font-weight="600">
Code Activity
</text>

<text x="${rightX + cardPadding}" y="130" fill="${colors.text}" font-size="14">
➕ Lines Added: ${codeStats.totalLinesAdded ?? 0}
</text>

<text x="${rightX + cardPadding}" y="152" fill="${colors.text}" font-size="14">
➖ Lines Deleted: ${codeStats.totalLinesDeleted ?? 0}
</text>

<text x="${rightX + cardPadding}" y="174" fill="${colors.text}" font-size="14">
📊 Net Lines: ${codeStats.netLines ?? 0}
</text>


<!-- LANGUAGES -->

<rect
x="${rightX}"
y="210"
width="${cardWidth}"
height="180"
rx="14"
fill="${colors.cardBg || "#00000020"}"
stroke="${colors.border}"
/>

<text
x="${rightX + cardPadding}"
y="235"
fill="${colors.title}"
font-size="17"
font-weight="600"
>
Top Languages
</text>

${languageRows}

</svg>
`;

}

module.exports = { renderReadmeDashboard };