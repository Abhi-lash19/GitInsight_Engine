require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { fetchTotalContributions } = require("./services/contributionService");
const { calculateTrafficStats } = require("./services/trafficService");
const { calculateCodeFrequencyStats } = require("./services/codeFrequencyService");
const { buildStats } = require("./aggregator/statsAggregator");
const { writeStatsToFile } = require("./output/writeJson");
const { isCacheValid, readCache } = require("./output/cacheManager");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 5B...\n");

        // Check cache first
        if (isCacheValid()) {
            console.log("⚡ Using cached stats (within TTL)\n");

            const cachedStats = readCache();
            console.log(JSON.stringify(cachedStats, null, 2));

            return;
        }

        console.log("♻️ Cache expired or not found. Computing fresh stats...\n");

        const repos = await fetchAllRepos();

        const [
            languageStats,
            totalContributions,
            trafficStats,
            codeStats,
        ] = await Promise.all([
            calculateLanguageStats(repos),
            fetchTotalContributions(githubConfig.username),
            calculateTrafficStats(repos),
            calculateCodeFrequencyStats(repos),
        ]);

        const stats = buildStats(
            githubConfig.username,
            repos,
            languageStats,
            totalContributions,
            trafficStats,
            codeStats
        );

        console.log("\n📊 Fresh GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));

        await writeStatsToFile(stats);

        console.log("\n✅ Phase 5B Complete");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
