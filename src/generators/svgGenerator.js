const fs = require("fs");
const path = require("path");

/**
 * Base SVG card generator
 */
function createCard({ title, lines }) {
    const width = 400;
    const height = 180;

    const lineHeight = 24;

    const textLines = lines
        .map(
            (line, index) => `
        <text x="20" y="${70 + index * lineHeight}" fill="#c9d1d9" font-size="16">
            ${line}
        </text>`
        )
        .join("");

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" rx="14" fill="#0d1117"/>
    
    <text x="20" y="40" fill="#58a6ff" font-size="20" font-weight="bold">
        ${title}
    </text>

    ${textLines}
</svg>
`;
}

/**
 * Save SVG to output/cards folder
 */
function saveSVG(username, name, svgContent) {
    const outputDir = path.join(__dirname, "../../output/cards");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${username}-${name}.svg`);

    fs.writeFileSync(filePath, svgContent);

    console.log(`🖼️ SVG generated: ${filePath}`);
}

module.exports = {
    createCard,
    saveSVG,
};
