/**
 * Orchestrator to generate all README cards
 */

const { renderOverviewCard } = require("./overviewCard");
const { renderLanguageCard } = require("./languageCard");
const { saveSVG } = require("./svgGenerator");
const { generateReadmeSnippet } = require("./readmeSnippet");
const { renderInsightsCard } = require("./insightsCard");

/**
 * Generate all cards + README snippet
 */
function generateAllCards(username, stats) {
    const start = Date.now();
    const theme = process.env.CARD_THEME || "dark";

    console.log("\n🎨 Generating README cards...\n");

    const overviewSvg = renderOverviewCard(stats, { theme });
    const languageSvg = renderLanguageCard(stats.languages, { theme });
    const insightsSvg = renderInsightsCard(stats, { theme });

    saveSVG(username, "overview", overviewSvg);
    saveSVG(username, "languages", languageSvg);
    saveSVG(username, "insights", insightsSvg);

    generateReadmeSnippet(username);

    console.log(`\n✅ Cards generated in ${Date.now() - start}ms\n`);
}

module.exports = { generateAllCards };
