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
            description: "GitHub username to analyze",
        })
        .option("deep-refresh", {
            alias: "dr",
            type: "boolean",
            description: "Force full rebuild (ignore incremental logic)",
            default: false,
        })
        .option("refresh", {
            alias: "r",
            type: "boolean",
            description: "Force refresh (ignore cache)",
            default: false,
        })
        .help()
        .alias("help", "h").argv;

    const perf = new PerfLogger();

    try {
        const activeUsername = argv.user || githubConfig.username;

        if (!activeUsername) {
            throw new Error("Username missing. Use --user <username>");
        }

        console.log("\nGitInsight Engine");
        console.log("────────────────────────────");
        console.log(`User: ${activeUsername}`);
        console.log(
            `Mode: ${argv["deep-refresh"]
                ? "DEEP REFRESH"
                : argv.refresh
                    ? "INCREMENTAL REFRESH"
                    : "CACHE"
            }\n`
        );

        /**
         * =========================
         * Cache Check
         * =========================
         */
        const cacheStage = perf.startStage("Cache Validation");

        if (!argv.refresh && !argv["deep-refresh"] && isCacheValid(activeUsername)) {
            perf.markCacheHit();
            perf.endStage(cacheStage);

            const cachedPayload = readCache(activeUsername);
            const cachedStats = cachedPayload?.data;

            const cardStage = perf.startStage("Generate SVG Cards");
            generateAllCards(activeUsername, cachedStats);
            perf.endStage(cardStage);

            perf.printSummary();
            return;
        }

        perf.endStage(cacheStage);

        githubConfig.username = activeUsername;

        /**
         * =========================
         * Fetch Repositories
         * =========================
         */
        const repoStage = perf.startStage("Fetch Repositories");
        const repos = await fetchAllRepos();
        perf.endStage(repoStage);

        /**
         * =========================
         * Compute Analytics
         * =========================
         */
        const analyticsStage = perf.startStage("Compute Analytics");

        const {
            languageStats,
            totalContributions,
            trafficStats,
            codeStats,
        } = await computeAnalytics(activeUsername, repos);

        let previousAdvancedStats = null;

        if (argv.refresh && !argv["deep-refresh"] && isCacheValid(activeUsername)) {
            const cached = readCache(activeUsername);
            previousAdvancedStats = cached?.data;
        }

        const advancedStats = await calculateAdvancedCommitStats(
            repos,
            languageStats,
            previousAdvancedStats
        );

        perf.endStage(analyticsStage);

        /**
         * =========================
         * Build Stats
         * =========================
         */
        const buildStage = perf.startStage("Build Stats Object");

        const stats = buildStats(
            activeUsername,
            repos,
            languageStats,
            totalContributions,
            trafficStats,
            codeStats,
            advancedStats
        );

        perf.endStage(buildStage);

        /**
         * =========================
         * Save JSON
         * =========================
         */
        const saveStage = perf.startStage("Write Stats JSON");
        await writeStatsToFile(activeUsername, stats);
        perf.endStage(saveStage);

        /**
         * =========================
         * Generate Cards
         * =========================
         */
        const cardStage = perf.startStage("Generate SVG Cards");
        generateAllCards(activeUsername, stats);
        perf.endStage(cardStage);

        perf.printSummary();

    } catch (error) {
        console.error("\nError:", error.message);
        throw error;
    }
}

module.exports = { runCLI };
