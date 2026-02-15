const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.resolve(process.cwd(), "output");
const REPO_CACHE_DIR = path.join(OUTPUT_DIR, "repo-cache");

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function ensureOutputDir() {
    ensureDir(OUTPUT_DIR);
    ensureDir(REPO_CACHE_DIR);
}

function getCacheFilePath(username) {
    ensureOutputDir();
    return path.join(OUTPUT_DIR, `${username}.json`);
}

function getRepoCacheDir(username) {
    ensureOutputDir();
    const dir = path.join(REPO_CACHE_DIR, username);
    ensureDir(dir);
    return dir;
}

function getRepoCacheFile(username, repoName, type) {
    const repoDir = getRepoCacheDir(username);
    return path.join(repoDir, `${repoName}_${type}.json`);
}

function isCacheValid(username) {
    const filePath = getCacheFilePath(username);

    if (!fs.existsSync(filePath)) return false;

    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;

    return fileAge < CACHE_TTL_MS;
}

function isRepoCacheValid(username, repoName, type) {
    const filePath = getRepoCacheFile(username, repoName, type);

    if (!fs.existsSync(filePath)) return false;

    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;

    return fileAge < CACHE_TTL_MS;
}

function readCache(username) {
    const filePath = getCacheFilePath(username);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function readRepoCache(username, repoName, type) {
    const filePath = getRepoCacheFile(username, repoName, type);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeRepoCache(username, repoName, type, data) {
    const filePath = getRepoCacheFile(username, repoName, type);
    fs.writeFileSync(filePath, JSON.stringify(data));
}

module.exports = {
    isCacheValid,
    readCache,
    getCacheFilePath,
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
};
