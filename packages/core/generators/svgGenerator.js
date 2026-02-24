const fs = require("fs");
const path = require("path");
const { getTheme } = require("../themes");

function createCard({ title, lines, themeName = "dark" }) {
    const theme = getTheme(themeName);
    const { colors } = theme;

    const width = 420;
    const paddingX = 24;
    const startY = 80;
    const rowHeight = 28;

    // Split "Label: Value"
    const rows = lines.map((line, i) => {
        const [label, value] = line.split(":");

        return `
        <text x="${paddingX}" y="${startY + i * rowHeight}" fill="${colors.text}" font-size="15">
            ${label}:
        </text>
        <text x="${width - paddingX}" y="${startY + i * rowHeight}" fill="${colors.textStrong || colors.title}" font-size="15" text-anchor="end">
            ${value.trim()}
        </text>`;
    }).join("");

    const height = startY + lines.length * rowHeight + 24;

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colors.bgStart}"/>
            <stop offset="100%" stop-color="${colors.bgEnd}"/>
        </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="16" fill="url(#bg)" stroke="${colors.border}"/>

    <text x="${paddingX}" y="44" fill="${colors.title}" font-size="20" font-weight="600">
        ${title}
    </text>

    ${rows}
</svg>
`;
}


/**
 * Save SVG to output/cards folder
 */
function saveSVG(username, name, svgContent) {
    const outputDir = path.join(process.cwd(), "cards");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${username}-${name}.svg`);

    fs.writeFileSync(filePath, svgContent);

    console.log(`🖼️ SVG generated: ${filePath}`);
}

module.exports = { createCard, saveSVG };
