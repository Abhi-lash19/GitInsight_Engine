const fs = require("fs");
const path = require("path");

function writeStatsToFile(username, stats) {
    const outputDir = path.join(process.cwd(), "output");

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${username}-stats.json`);

    fs.writeFileSync(
        filePath,
        JSON.stringify(stats, null, 2),
        "utf-8"
    );

    console.log(`📁 Stats saved to ${filePath}`);
}

module.exports = { writeStatsToFile };
