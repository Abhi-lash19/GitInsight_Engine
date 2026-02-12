require("dotenv").config();

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { buildBasicStats } = require("./aggregator/statsAggregator");

async function run() {
    try {
        console.log("🚀 Starting GitInsight Engine Phase 1...\n");

        const repos = await fetchAllRepos();

        const stats = buildBasicStats(githubConfig.username, repos);

        console.log("\n📊 Basic GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
