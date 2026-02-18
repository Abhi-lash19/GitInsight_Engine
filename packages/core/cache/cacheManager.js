const fs = require("fs");
const path = require("path");
const { redis } = require("./redisClient");

const OUTPUT_DIR = path.resolve(process.cwd(), "output");
const REPO_CACHE_DIR = path.join(OUTPUT_DIR, "repo-cache");

const CACHE_TTL_MS = process.env.CACHE_TTL
    ? Number(process.env.CACHE_TTL) * 1000
    : 60 * 60 * 1000; // 1 hour

const memoryCache = new Map();

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

async function getApiCache(key) {
    if (redis) {
        const value = await redis.get(key);
        if (value) return JSON.parse(value);
    }

    return memoryCache.get(key) || null;
}

async function setApiCache(key, value) {
    if (redis) {
        await redis.set(key, JSON.stringify(value), "EX", CACHE_TTL_MS / 1000);
    }
    memoryCache.set(key, value);
}

module.exports = {
    isCacheValid,
    readCache,
    getCacheFilePath,
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
    getApiCache,
    setApiCache,
};
