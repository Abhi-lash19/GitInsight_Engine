const fs = require("fs");
const path = require("path");

/**
 * Generate README markdown snippet
 */
function generateReadmeSnippet(username) {
    const outputDir = path.join(__dirname, "../../output");

    const baseUrl = process.env.PUBLIC_STATS_BASE_URL || null;

    const card = (name) =>
        baseUrl
            ? `${baseUrl}/api/v1/cards/${name}/${username}`
            : `./cards/${username}-${name}.svg`;

    const snippet = `
## 📊 GitHub Stats

![Overview](${card("overview")})
![Languages](${card("languages")})
![Insights](${card("insights")})
![Commits](${card("commits")})
![Code Stats](${card("codestats")})
`;

    const filePath = path.join(outputDir, `${username}-README-snippet.md`);

    fs.writeFileSync(filePath, snippet.trim());

    console.log(`📝 README snippet generated: ${filePath}`);
}

module.exports = { generateReadmeSnippet };