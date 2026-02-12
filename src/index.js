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

// ---------------- CLI ARGUMENT PARSING ----------------

function parseArgs() {
    const args = process.argv.slice(2);

    const options = {
        username: null,
        refresh: false,
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--user" && args[i + 1]) {
            options.username = args[i + 1];
        }

        if (args[i] === "--refresh") {
            options.refresh = true;
        }
    }

    return options;
}

// ---------------- MAIN EXECUTION ----------------

async function run() {
    try {
        const { username, refresh } = parseArgs();

        const activeUsername = username || githubConfig.username;

        if (!activeUsername) {
            throw new Error(
                "No username provided. Use --user <username> or set GITHUB_USERNAME in .env"
            );
        }

        console.log("🚀 Starting GitInsight Engine Phase 6...\n");
        console.log(`👤 Target User: ${activeUsername}`);
        console.log(`🔄 Force Refresh: ${refresh ? "YES" : "NO"}\n`);

        // Skip cache if refresh flag used
        if (!refresh && isCacheValid(activeUsername)) {
            console.log("⚡ Using cached stats (within TTL)\n");

            const cachedStats = readCache();
            console.log(JSON.stringify(cachedStats, null, 2));
            return;
        }

        console.log("♻️ Cache expired or refresh requested. Computing fresh stats...\n");

        // Override username dynamically
        githubConfig.username = activeUsername;

        const repos = await fetchAllRepos();

        const [
            languageStats,
            totalContributions,
            trafficStats,
            codeStats,
        ] = await Promise.all([
            calculateLanguageStats(repos),
            fetchTotalContributions(activeUsername),
            calculateTrafficStats(repos),
            calculateCodeFrequencyStats(repos),
        ]);

        const stats = buildStats(
            activeUsername,
            repos,
            languageStats,
            totalContributions,
            trafficStats,
            codeStats
        );

        console.log("\n📊 Fresh GitHub Stats:");
        console.log(JSON.stringify(stats, null, 2));

        await writeStatsToFile(activeUsername, stats);

        console.log("\n✅ Phase 6 Complete");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();
