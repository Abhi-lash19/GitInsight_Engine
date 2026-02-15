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
    console.log("\n🎨 Generating README cards...\n");

    generateOverviewCard(username, stats);
    generateLanguageCard(username, stats.languages);

    generateReadmeSnippet(username);

    console.log("\n✅ Cards + README snippet generated\n");
}

module.exports = { generateAllCards };
