require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { buildStats } = require("./aggregator/statsAggregator");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 2...\n");

        const repos = await fetchAllRepos();

        const languageStats = await calculateLanguageStats(repos);

        const stats = buildStats(
            githubConfig.username,
            repos,
            languageStats
        );

        console.log("\n📊 Full GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
