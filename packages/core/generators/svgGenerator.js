const fs = require("fs");
const path = require("path");

/**
 * Base SVG card generator (modern theme)
 */
function createCard({ title, lines }) {
    const width = 420;
    const height = 190;

    const lineHeight = 26;

    const textLines = lines
        .map(
            (line, index) => `
        <text x="24" y="${80 + index * lineHeight}" fill="#e6edf3" font-size="16">
            ${line}
        </text>`
        )
        .join("");

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0d1117"/>
            <stop offset="100%" stop-color="#161b22"/>
        </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="16" fill="url(#bg)" stroke="#30363d"/>

    <text x="24" y="42" fill="#58a6ff" font-size="20" font-weight="600">
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
