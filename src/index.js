require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { fetchTotalContributions } = require("./services/contributionService");
const { calculateTrafficStats } = require("./services/trafficService");
const { calculateCodeFrequencyStats } = require("./services/codeFrequencyService");
const { buildStats } = require("./aggregator/statsAggregator");
const { writeStatsToFile } = require("./output/writeJson");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 5A...\n");

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

        console.log("\n📊 Final GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));

        // NEW: Save to JSON
        await writeStatsToFile(stats);

        console.log("\n✅ Phase 5A Complete");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
