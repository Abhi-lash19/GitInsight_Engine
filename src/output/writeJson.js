const fs = require("fs");
const path = require("path");

async function writeStatsToFile(data) {
    try {
        const outputDir = path.join(__dirname, "../../output");

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, "stats.json");

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`\n💾 Stats saved to: ${filePath}`);
    } catch (error) {
        console.error("❌ Failed to write stats file:", error.message);
    }
}

module.exports = { writeStatsToFile };
