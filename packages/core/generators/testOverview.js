const fs = require("fs");
const path = require("path");
const { generateOverviewCard } = require("./overviewCard");

const username = "Abhi-lash19";

const statsPath = path.join(__dirname, `../../output/${username}.json`);

if (!fs.existsSync(statsPath)) {
    console.error("❌ Stats JSON not found. Run engine first.");
    process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));

generateOverviewCard(username, stats);

console.log("✅ Overview SVG test complete");
