const { computeStats } = require("./computeStats");
const { isCacheValid, readCache } = require("../cache/cacheManager");
const { writeStatsToFile } = require("../output/writeJson");
const { generateAllCards } = require("../generators/generateAllCards");

const activeRuns = new Map();
const memoryStatsCache = new Map();

/**
 * Centralized Stats Service
 * - Prevent duplicate computation
 * - Unified cache strategy
 * - Used by CLI + API
 */
async function getStats(username, options = {}) {
    const { refresh = false, deepRefresh = false } = options;

    /**
     * =========================
     * In-Memory Cache
     * =========================
     */
    if (!refresh && !deepRefresh && memoryStatsCache.has(username)) {
        const cachedStats = memoryStatsCache.get(username);

        // background refresh (stale-while-revalidate)
        if (!activeRuns.has(username)) {
            refreshStatsInBackground(username);
        }

        return {
            stats: cachedStats,
            cacheHit: true,
        };
    }

    /**
     * =========================
     * File Cache (CLI level)
     * =========================
     */
    if (!refresh && !deepRefresh && isCacheValid(username)) {
        const cachedPayload = readCache(username);
        const stats = cachedPayload?.data || cachedPayload;

        memoryStatsCache.set(username, stats);

        // background refresh
        if (!activeRuns.has(username)) {
            refreshStatsInBackground(username);
        }

        return {
            stats,
            cacheHit: true,
        };
    }

    /**
     * =========================
     * Execution Deduplication
     * =========================
     */
    if (activeRuns.has(username)) {
        const stats = await activeRuns.get(username);
        return {
            stats,
            cacheHit: false,
        };
    }

    const promise = computeAndStoreStats(username);

    activeRuns.set(username, promise);

    const stats = await promise;

    return {
        stats,
        cacheHit: false,
    };
}

/**
 * =========================
 * Compute + Store Stats
 * =========================
 */
async function computeAndStoreStats(username) {
    const stats = await computeStats(username);

    await writeStatsToFile(username, stats);

    // regenerate SVG cards when stats change
    generateAllCards(username, stats);

    memoryStatsCache.set(username, stats);

    activeRuns.delete(username);

    return stats;
}

/**
 * =========================
 * Background Refresh
 * =========================
 */
function refreshStatsInBackground(username) {
    const promise = computeAndStoreStats(username).catch((err) => {
        console.error("Background stats refresh failed:", err);
        activeRuns.delete(username);
    });

    activeRuns.set(username, promise);
}

module.exports = { getStats };