/**
 * Orchestrator to generate all README cards
 */

const { generateOverviewCard } = require("./overviewCard");
const { generateLanguageCard } = require("./languageCard");

function generateAllCards(username, stats) {
    console.log("\n🎨 Generating README cards...\n");

    generateOverviewCard(username, stats);
    generateLanguageCard(username, stats.languages);

    console.log("\n✅ All cards generated\n");
}

module.exports = { generateAllCards };
