const fs = require("fs");
const path = require("path");

/**
 * Generate README markdown snippet
 */
function generateReadmeSnippet(username) {
    const baseUrl = process.env.PUBLIC_STATS_BASE_URL || null;

    const card = (name) =>
        baseUrl
            ? `${baseUrl}/api/v1/cards/${name}/${username}`
            : `./cards/${username}-${name}.svg`;

    const snippet = `
---
## 📊 GitHub Stats

![Overview](${card("overview")})
![Languages](${card("languages")})
![Insights](${card("insights")})
![Commits](${card("commits")})
![Code Stats](${card("codestats")})
![Heatmap](${card("heatmap")})
`;

    console.log("\n📋 Copy this into your root README.md:\n");
    console.log(snippet.trim());
}

module.exports = { generateReadmeSnippet };