#!/usr/bin/env node

const { runCLI } = require("../../packages/core/index");

// Run only when executed directly via node / bin
if (require.main === module) {
    runCLI()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}