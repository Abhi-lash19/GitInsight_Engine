const { getTheme } = require("../themes");
const { renderCard } = require("./cardRenderer");

const { renderOverviewContent } = require("./overviewCard");
const { renderLanguageContent } = require("./languageCard");
const { renderInsightsContent } = require("./insightsCard");
const { renderCommitsContent } = require("./commitsCard");
const { renderCodeStatsContent } = require("./codestatsCard");
const { renderHeatmapContent } = require("./heatmapCard");
const { renderImpactContent } = require("./impactCard");

function renderReadmeDashboard(stats, options = {}) {

    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const safeStats = stats?.stats || stats?.data || stats || {};

    const width = 900;
    const height = 1050;

    const padding = 32;
    const columnGap = 36;
    const cardWidth = 390;

    const leftX = padding;
    const rightX = padding + cardWidth + columnGap;

    const row1Y = 70;
    const row2Y = row1Y + 160;
    const row3Y = row2Y + 160;
    const row4Y = row3Y + 300;
    const row5Y = row4Y + 180;

    const overviewCard = { x: leftX, y: row1Y, width: cardWidth, height: 140 };
    const insightsCard = { x: rightX, y: row1Y, width: cardWidth, height: 140 };

    const codeCard = { x: leftX, y: row2Y, width: cardWidth, height: 140 };
    const commitsCard = { x: rightX, y: row2Y, width: cardWidth, height: 140 };

    const heatmapCard = {
        x: leftX,
        y: row3Y,
        width: cardWidth * 2 + columnGap,
        height: 260
    };

    const languagesCard = { x: leftX, y: row4Y, width: cardWidth, height: 150 };
    const reposCard = { x: rightX, y: row4Y, width: cardWidth, height: 150 };

    const impactCard = { x: leftX, y: row5Y, width: cardWidth, height: 150 };
    const activityCard = { x: rightX, y: row5Y, width: cardWidth, height: 150 };

    const wrap = (content) => `
<g transform="translate(20,50)" fill="${colors.text}" font-size="13">
${content}
</g>`;

    return `
<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">

<rect width="100%" height="100%" rx="20" fill="${colors.cardBg}" stroke="${colors.border}" />

<text x="${padding}" y="48" fill="${colors.title}" font-size="26" font-weight="700">
🚀 GitInsight Profile
</text>

${renderCard({ ...overviewCard, title: "Overview", colors, content: wrap(renderOverviewContent(safeStats)) })}
${renderCard({ ...insightsCard, title: "Developer Insights", colors, content: wrap(renderInsightsContent(safeStats)) })}

${renderCard({ ...codeCard, title: "Code Activity", colors, content: wrap(renderCodeStatsContent(safeStats)) })}
${renderCard({ ...commitsCard, title: "Commit Distribution", colors, content: wrap(renderCommitsContent(safeStats)) })}

${renderCard({
        ...heatmapCard,
        title: "Contribution Heatmap",
        colors,
        content: `<g transform="translate(40,60)">${renderHeatmapContent(safeStats)}</g>`
    })}

${renderCard({ ...languagesCard, title: "Languages", colors, content: wrap(renderLanguageContent(safeStats.languages || {})) })}
${renderCard({ ...reposCard, title: "Top Repositories", colors, content: wrap(renderCommitsContent(safeStats)) })}

${renderCard({ ...impactCard, title: "Repo Impact", colors, content: wrap(renderImpactContent(safeStats)) })}
${renderCard({ ...activityCard, title: "Commit Activity", colors, content: wrap(renderCommitsContent(safeStats)) })}

</svg>
`;
}

module.exports = { renderReadmeDashboard };