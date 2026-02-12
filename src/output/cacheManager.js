const fs = require("fs");
const path = require("path");

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheFilePath(username) {
    return path.join(__dirname, `../../output/${username}.json`);
}

function isCacheValid(username) {
    const filePath = getCacheFilePath(username);

    if (!fs.existsSync(filePath)) {
        return false;
    }

    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;

    return fileAge < CACHE_TTL_MS;
}

function readCache(username) {
    const filePath = getCacheFilePath(username);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

module.exports = {
    isCacheValid,
    readCache,
    getCacheFilePath,
};
