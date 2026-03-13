const fs = require("fs");
const path = require("path");
const { getCacheFilePath } = require("../cache/cacheManager");
const { validateStats } = require("../config/statsSchema");

function writeStatsToFile(username, stats) {
    // Validate stats structure before writing
    const { isValid, errors, warnings } = validateStats(stats);

    if (!isValid) {
        console.error(`❌ Critical validation errors found for ${username}:`);
        errors.forEach(error => console.error(`   - ${error}`));
        // Don't crash the CLI, but log the issue
        console.warn(`⚠️ Proceeding with stats output despite validation errors`);
    } else {
        console.log(`✅ Stats validation passed for ${username}`);
    }

    const filePath = getCacheFilePath(username);

    const payload = {
        generatedAt: Date.now(),
        data: stats,
        validation: {
            isValid,
            errors,
            warnings
        }
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(payload, null, 2),
        "utf-8"
    );

    console.log(`Stats saved → ${filePath}`);
}

module.exports = { writeStatsToFile };
