#!/usr/bin/env node
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
const { buildStats } = require("./aggregator/statsAggregator");
const { writeStatsToFile } = require("./output/writeJson");
const { isCacheValid, readCache } = require("./output/cacheManager");

// ---------------- CLI CONFIG ----------------

const argv = yargs(process.argv.slice(2))
    .option("user", {
        alias: "u",
        type: "string",
        description: "GitHub username to analyze",
    })
    .option("refresh", {
        alias: "r",
        type: "boolean",
        description: "Force refresh (ignore cache)",
        default: false,
    })
    .help()
    .alias("help", "h").argv;

// ---------------- MAIN EXECUTION ----------------

async function run() {
    try {
        const activeUsername = argv.user || githubConfig.username;

        if (!activeUsername) {
            console.log(
                chalk.red(
                    "❌ No username provided. Use --user <username> or set GITHUB_USERNAME in .env"
                )
            );
            process.exit(1);
        }

        console.log(chalk.cyan.bold("\n🚀 GitInsight Engine\n"));
        console.log(chalk.white(`👤 Target User: ${activeUsername}`));
        console.log(chalk.white(`🔄 Force Refresh: ${argv.refresh ? "YES" : "NO"}\n`));

        // Cache check
        if (!argv.refresh && isCacheValid(activeUsername)) {
            console.log(chalk.yellow("⚡ Using cached stats (within TTL)\n"));

            const cachedStats = readCache(activeUsername);
            console.log(JSON.stringify(cachedStats, null, 2));
            return;
        }

        console.log(chalk.gray("♻️ Computing fresh stats...\n"));

        // Override config username
        githubConfig.username = activeUsername;

        const spinner = ora("Fetching repositories...").start();

        const repos = await fetchAllRepos();
        spinner.succeed("Repositories fetched");

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

        const stats = buildStats(
            activeUsername,
            repos,
            languageStats,
            totalContributions,
            trafficStats,
            codeStats
        );

        console.log(chalk.green("\n📊 GitHub Stats:\n"));
        console.log(JSON.stringify(stats, null, 2));

        await writeStatsToFile(activeUsername, stats);

        console.log(chalk.green("\n✅ Done\n"));
    } catch (error) {
        console.log(chalk.red("\n❌ Error:"), error.message);
    }
}

run();
