/**
 * Orchestrator to generate all README cards
 */

const { generateOverviewCard } = require("./overviewCard");
const { generateLanguageCard } = require("./languageCard");
const { generateReadmeSnippet } = require("./readmeSnippet");

/**
 * Generate all cards + README snippet
 */
function generateAllCards(username, stats) {
    const start = Date.now();
    const theme = process.env.CARD_THEME || "dark";

    console.log("\n🎨 Generating README cards...\n");

    generateOverviewCard(username, stats, theme);
    generateLanguageCard(username, stats.languages);

    generateReadmeSnippet(username);

    console.log(`\n✅ Cards generated in ${Date.now() - start}ms\n`);
}

module.exports = { generateAllCards };
