/**
 * Orchestrator to generate all README cards
 */

const { renderOverviewCard } = require("./overviewCard");
const { renderLanguageCard } = require("./languageCard");
const { saveSVG } = require("./svgGenerator");
const { generateReadmeSnippet } = require("./readmeSnippet");
const { renderInsightsCard } = require("./insightsCard");
const { renderCommitsCard } = require("./commitsCard");
const { renderCodeStatsCard } = require("./codeStatsCard");
const { renderHeatmapCard } = require("./heatmapCard");
const { renderImpactCard } = require("./impactCard");
const { renderReadmeDashboard } = require("./readmeDashboardCard");

/**
 * Generate all cards + README snippet
 */
function generateAllCards(username, stats) {
    const start = Date.now();
    const theme = process.env.CARD_THEME || "dark";
    const heatmapSvg = renderHeatmapCard(stats, { theme });

    console.log("\n🎨 Generating README cards...\n");

    const overviewSvg = renderOverviewCard(stats, { theme });
    const languageSvg = renderLanguageCard(stats.languages, { theme });
    const insightsSvg = renderInsightsCard(stats, { theme });
    const commitsSvg = renderCommitsCard(stats, { theme });
    const codeSvg = renderCodeStatsCard(stats, { theme });
    const impactSvg = renderImpactCard(stats, { theme });
    const dashboardSvg = renderReadmeDashboard(stats, { theme });

    saveSVG(username, "overview", overviewSvg);
    saveSVG(username, "languages", languageSvg);
    saveSVG(username, "insights", insightsSvg);
    saveSVG(username, "commits", commitsSvg);
    saveSVG(username, "codestats", codeSvg);
    saveSVG(username, "heatmap", heatmapSvg);
    saveSVG(username, "impact", impactSvg);
    saveSVG(username, "readme", dashboardSvg);

    generateReadmeSnippet(username);

    console.log(`\n✅ Cards generated in ${Date.now() - start}ms\n`);
}

module.exports = { generateAllCards };
