/**
 * GitInsight SVG Component Library
 *
 * Reusable UI primitives for dashboard content renderers.
 *
 * These components return raw SVG fragments that can be safely
 * injected inside the card container (`renderCard`).
 *
 * IMPORTANT DESIGN RULES
 * ----------------------
 * 1. All coordinates are LOCAL coordinates.
 *    The dashboard container will position them.
 *
 * 2. No <svg> tags inside components.
 *    They must be safe to place inside <g>.
 *
 * 3. Components must NOT overflow card width.
 *
 * 4. Each component should be deterministic and reusable.
 *
 * Example usage inside cards:
 *
 * const { statRow, progressBar } = require("./components");
 *
 * return statRow("Stars", 120, 0);
 * return progressBar("JavaScript", 42, 100, 22);
 */

/**
 * ==========================================================
 * Utility: Escape SVG text
 * Prevents issues with repo names containing special chars
 * ==========================================================
 */
function escapeText(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * ==========================================================
 * STAT ROW
 *
 * Example:
 * Repositories           24
 * Stars                  103
 *
 * ==========================================================
 */
function statRow(label, value, y, options = {}) {
    const {
        labelX = 0,
        valueX = 260,
        fontSize = 13,
        labelColor = "#c9d1d9",
        valueColor = "#ffffff",
        fontWeight = "600",
    } = options;

    return `
    <text x="${labelX}" y="${y}" fill="${labelColor}" font-size="${fontSize}">
      ${escapeText(label)}
    </text>
  
    <text
      x="${valueX}"
      y="${y}"
      fill="${valueColor}"
      text-anchor="end"
      font-size="${fontSize}"
      font-weight="${fontWeight}">
      ${escapeText(value)}
    </text>
    `;
}

/**
 * ==========================================================
 * PROGRESS BAR
 *
 * Used for:
 * - Languages
 * - Repo impact
 * - Commit distribution
 *
 * Example:
 * JavaScript  ████████████   45
 *
 * ==========================================================
 */
function progressBar(label, value, max, y, options = {}) {
    const {
        labelX = 0,
        barX = 110,
        barWidth = 170,
        barHeight = 8,
        labelWidth = 100,
        radius = 4,
        bgColor = "#30363d",
        color = "#58a6ff",
        valueColor = "#8b949e",
        fontSize = 12,
    } = options;

    const safeValue = Number(value) || 0;
    const safeMax = Number(max) || 1;

    const width = Math.max(
        0,
        Math.min(barWidth, (safeValue / safeMax) * barWidth)
    );

    return `
    <text x="${labelX}" y="${y}" fill="#c9d1d9" font-size="${fontSize}">
      ${escapeText(label)}
    </text>
  
    <!-- background bar -->
    <rect
      x="${barX}"
      y="${y - barHeight}"
      width="${barWidth}"
      height="${barHeight}"
      rx="${radius}"
      fill="${bgColor}"
    />
  
    <!-- value bar -->
    <rect
      x="${barX}"
      y="${y - barHeight}"
      width="${width}"
      height="${barHeight}"
      rx="${radius}"
      fill="${color}"
    />
  
    <text
      x="${barX + barWidth + 6}"
      y="${y}"
      fill="${valueColor}"
      font-size="${fontSize}">
      ${safeValue}
    </text>
    `;
}

/**
 * ==========================================================
 * LANGUAGE ROW
 *
 * Language dot + label + percentage
 *
 * Example:
 * ● JavaScript        40%
 *
 * ==========================================================
 */
function languageRow(language, percent, y, options = {}) {
    const {
        dotX = 0,
        labelX = 12,
        valueX = 260,
        dotRadius = 4,
        dotColor = "#58a6ff",
        fontSize = 13,
    } = options;

    return `
    <circle cx="${dotX}" cy="${y - 4}" r="${dotRadius}" fill="${dotColor}" />
  
    <text x="${labelX}" y="${y}" fill="#c9d1d9" font-size="${fontSize}">
      ${escapeText(language)}
    </text>
  
    <text
      x="${valueX}"
      y="${y}"
      fill="#8b949e"
      font-size="${fontSize}"
      text-anchor="end">
      ${percent}%
    </text>
    `;
}

/**
 * ==========================================================
 * REPOSITORY ROW
 *
 * Used for repo lists like:
 * - Top repos
 * - Impact ranking
 *
 * Example:
 * repo-name            ★ 124
 *
 * ==========================================================
 */
function repoRow(name, value, y, options = {}) {
    const {
        labelX = 0,
        valueX = 260,
        fontSize = 13,
    } = options;

    return `
    <text x="${labelX}" y="${y}" fill="#c9d1d9" font-size="${fontSize}">
      ${escapeText(name)}
    </text>
  
    <text
      x="${valueX}"
      y="${y}"
      text-anchor="end"
      fill="#8b949e"
      font-size="${fontSize}">
      ${value}
    </text>
    `;
}

/**
 * ==========================================================
 * SECTION LABEL
 *
 * Used for internal grouping
 *
 * Example:
 * ─ Languages ─
 *
 * ==========================================================
 */
function sectionLabel(text, y, options = {}) {
    const {
        x = 0,
        fontSize = 12,
        color = "#8b949e",
    } = options;

    return `
    <text
      x="${x}"
      y="${y}"
      fill="${color}"
      font-size="${fontSize}"
      font-weight="600">
      ${escapeText(text)}
    </text>
    `;
}

/**
 * ==========================================================
 * GRID UTILITY
 *
 * Helps calculate row positions automatically
 *
 * Example:
 * const grid = createRowGrid(22)
 * grid.next()
 *
 * ==========================================================
 */
function createRowGrid(rowHeight = 22) {
    let row = 0;

    return {
        next() {
            const y = row * rowHeight;
            row++;
            return y;
        },
    };
}

module.exports = {
    statRow,
    progressBar,
    languageRow,
    repoRow,
    sectionLabel,
    createRowGrid,
};