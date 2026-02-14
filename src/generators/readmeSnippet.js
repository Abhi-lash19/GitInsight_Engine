const fs = require("fs");
const path = require("path");

/**
 * Generate README markdown snippet
 */
function generateReadmeSnippet(username) {
    const outputDir = path.join(__dirname, "../../output");

    const snippet = `
## 📊 GitHub Stats

![Overview](./output/cards/${username}-overview.svg)
![Languages](./output/cards/${username}-languages.svg)
`;

    const filePath = path.join(outputDir, `${username}-README-snippet.md`);

    fs.writeFileSync(filePath, snippet.trim());

    console.log(`📝 README snippet generated: ${filePath}`);
}

module.exports = { generateReadmeSnippet };
