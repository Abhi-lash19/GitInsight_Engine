const { computeStats } = require("./computeStats");
const { isCacheValid, readCache } = require("../cache/cacheManager");
const { writeStatsToFile } = require("../output/writeJson");

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
        return {
            stats: memoryStatsCache.get(username),
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

    const promise = (async () => {
        const stats = await computeStats(username);

        await writeStatsToFile(username, stats);

        memoryStatsCache.set(username, stats);
        activeRuns.delete(username);

        return stats;
    })();

    activeRuns.set(username, promise);

    const stats = await promise;

    return {
        stats,
        cacheHit: false,
    };
}

module.exports = { getStats };