require("dotenv").config();

const yargs = require("yargs");
const chalk = require("chalk").default;
const ora = require("ora").default;

const githubConfig = require("./config/githubConfig");
const { fetchAllRepos } = require("./services/repoService");
const { calculateLanguageStats } = require("./services/languageService");
const { fetchTotalContributions } = require("./services/contributionService");
const { calculateTrafficStats } = require("./services/trafficService");
const { calculateCodeFrequencyStats } = require("./services/codeFrequencyService");
const { calculateAdvancedCommitStats } = require("./services/advancedStatsService");
const { buildStats } = require("./aggregator/statsAggregator");
const { writeStatsToFile } = require("./output/writeJson");
const { isCacheValid, readCache } = require('./cache/cacheManager');
const { generateAllCards } = require("./generators/generateAllCards");
const { PerfLogger } = require("./utils/logger");
const { getStats } = require("./application/statsService");

async function computeAnalytics(activeUsername, repos) {
    const analyticsSpinner = ora("Calculating analytics...").start();

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

    analyticsSpinner.succeed("Analytics complete");

    return {
        languageStats,
        totalContributions,
        trafficStats,
        codeStats,
    };
}

async function runCLI() {
    const argv = yargs(process.argv.slice(2))
        .option("user", {
            alias: "u",
            type: "string",
        })
        .option("refresh", {
            alias: "r",
            type: "boolean",
            description: "Force refresh (ignore cache)",
            default: false,
        })
        .option("deep-refresh", {
            alias: "dr",
            type: "boolean",
            description: "Force full rebuild (ignore incremental logic)",
            default: false,
        })
        .help()
        .alias("help", "h").argv;

    const perf = new PerfLogger();

    try {
        const username = argv.user || githubConfig.username;
        if (!username) throw new Error("Username missing");

        console.log("\nGitInsight Engine");
        console.log("────────────────────────────");
        console.log(`User: ${username}\n`);
        console.log(
            `Mode: ${argv["deep-refresh"]
                ? "DEEP REFRESH"
                : argv.refresh
                    ? "INCREMENTAL REFRESH"
                    : "CACHE"
            }\n`
        );

        const statsStage = perf.startStage("Get Stats");

        const result = await getStats(username, {
            refresh: argv.refresh,
            deepRefresh: argv["deep-refresh"],
        });

        const stats = result.stats;

        if (result.cacheHit) {
            perf.markCacheHit();
            perf.markCacheHit();
        } else {
            perf.markCacheMiss();
        }

        perf.endStage(statsStage);

        const cardStage = perf.startStage("Generate SVG Cards");
        generateAllCards(username, stats);
        perf.endStage(cardStage);

        perf.printSummary();

    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

module.exports = { runCLI };
