#!/usr/bin/env node

const { runCLI } = require("../../packages/core/index");

if (process.argv.includes("--help")) {
    console.log(`
GitInsight CLI

Usage:
  gitinsight --user <username>       Generate stats
  gitinsight --user <username> --refresh
  gitinsight --help

Description:
  Generates GitHub analytics, SVG cards, and heatmaps.
`);
    process.exit(0);
}

if (require.main === module) {
    runCLI()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}