require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { fetchTotalContributions } = require("./services/contributionService");
const { buildStats } = require("./aggregator/statsAggregator");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 3...\n");

        const repos = await fetchAllRepos();

        const [languageStats, totalContributions] =
            await Promise.all([
                calculateLanguageStats(repos),
                fetchTotalContributions(githubConfig.username),
            ]);

        const stats = buildStats(
            githubConfig.username,
            repos,
            languageStats,
            totalContributions
        );

        console.log("\n📊 Advanced GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
