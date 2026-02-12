const fs = require("fs");
const path = require("path");

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheFilePath() {
    return path.join(__dirname, "../../output/stats.json");
}

function isCacheValid() {
    const filePath = getCacheFilePath();

    if (!fs.existsSync(filePath)) {
        return false;
    }

    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;

    return fileAge < CACHE_TTL_MS;
}

function readCache() {
    const filePath = getCacheFilePath();

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

module.exports = {
    isCacheValid,
    readCache,
};
