const fs = require("fs");
const path = require("path");
const { getCacheFilePath } = require("../cache/cacheManager");

function writeStatsToFile(username, stats) {
    const filePath = getCacheFilePath(username);

    const payload = {
        generatedAt: Date.now(),
        data: stats,
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(payload, null, 2),
        "utf-8"
    );

    console.log(`Stats saved → ${filePath}`);
}

module.exports = { writeStatsToFile };
