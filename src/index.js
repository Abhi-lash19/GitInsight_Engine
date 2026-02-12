require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { fetchTotalContributions } = require("./services/contributionService");
const { calculateTrafficStats } = require("./services/trafficService");
const { buildStats } = require("./aggregator/statsAggregator");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 4A...\n");

        const repos = await fetchAllRepos();

        const [languageStats, totalContributions, trafficStats] =
            await Promise.all([
                calculateLanguageStats(repos),
                fetchTotalContributions(githubConfig.username),
                calculateTrafficStats(repos),
            ]);

        const stats = buildStats(
            githubConfig.username,
            repos,
            languageStats,
            totalContributions,
            trafficStats
        );

        console.log("\n📊 Phase 4A GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
