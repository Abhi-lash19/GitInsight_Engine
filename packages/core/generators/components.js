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

/**
 * ==========================================================
 * DONUT CHART
 *
 * Used for proportional distributions, e.g.
 * - Language shares
 * - Repo impact buckets
 * - Commit distribution
 *
 * Returns a local <g> fragment with a donut and legend.
 *
 * Example data:
 * [{ label: "JavaScript", value: 40 }, ...]
 * ==========================================================
 */
function donutChart(data = [], options = {}) {
  const {
    cx = 60,
    cy = 60,
    radius = 32,
    thickness = 10,
    colors = ["#58a6ff", "#f97316", "#22c55e", "#eab308", "#ec4899"],
    labelStartX = 120,
    labelStartY = 48,
    labelLineHeight = 18,
    fontSize = 12,
  } = options;

  const safeData = (Array.isArray(data) ? data : []).filter(d => Number(d.value) > 0);
  const total = safeData.reduce((sum, d) => sum + Number(d.value || 0), 0) || 1;

  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  const slices = safeData.map((d, index) => {
    const value = Number(d.value || 0);
    const fraction = value / total;
    const arcLength = fraction * circumference;

    const dashArray = `${arcLength} ${circumference - arcLength}`;
    const dashOffset = -offset;

    offset += arcLength;

    const color = colors[index % colors.length];

    return `
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${radius}"
        fill="transparent"
        stroke="${color}"
        stroke-width="${thickness}"
        stroke-dasharray="${dashArray}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 ${cx} ${cy})"
      />`;
  }).join("");

  const labels = safeData.map((d, index) => {
    const color = colors[index % colors.length];
    const y = labelStartY + index * labelLineHeight;
    const percent = ((Number(d.value || 0) / total) * 100).toFixed(1);

    return `
      <circle cx="${labelStartX}" cy="${y - 5}" r="4" fill="${color}" />
      <text x="${labelStartX + 10}" y="${y}" fill="#c9d1d9" font-size="${fontSize}">
        ${escapeText(d.label || "")} (${percent}%)
      </text>`;
  }).join("");

  return `
    <g>
      ${slices}
      ${labels}
    </g>
    `;
}

/**
 * ==========================================================
 * SPARKLINE
 *
 * Used for compact trend lines, e.g.
 * - Commit activity over time
 *
 * Example data: [3,5,2,8,10,6]
 * ==========================================================
 */
function sparkline(data = [], options = {}) {
  const {
    width = 160,
    height = 40,
    color = "#58a6ff",
    strokeWidth = 1.5,
    baselineColor = "#30363d",
  } = options;

  const values = (Array.isArray(data) ? data : []).map(v => Number(v) || 0);

  if (!values.length) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = i * stepX;
    const normalized = (v - min) / range;
    const y = height - normalized * height;
    return `${x},${y}`;
  }).join(" ");

  return `
    <g>
      <line
        x1="0"
        y1="${height}"
        x2="${width}"
        y2="${height}"
        stroke="${baselineColor}"
        stroke-width="1"
      />
      <polyline
        fill="none"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        points="${points}"
      />
    </g>
    `;
}

/**
 * ==========================================================
 * LINE CHART
 *
 * Used for growth trends, e.g.
 * - Repo growth over months
 *
 * Example data: [{ x: "Jan", y: 10 }, ...]
 * ==========================================================
 */
function lineChart(data = [], options = {}) {
  const {
    width = 220,
    height = 80,
    color = "#58a6ff",
    strokeWidth = 1.5,
    showXAxis = true,
    axisColor = "#30363d",
    labelFontSize = 11,
    paddingLeft = 8,
    paddingRight = 8,
    paddingBottom = 14,
  } = options;

  const points = (Array.isArray(data) ? data : [])
    .map(d => ({ x: d.x, y: Number(d.y) || 0 }));

  if (!points.length) {
    return "";
  }

  const ys = points.map(p => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingBottom;

  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const pathPoints = points.map((p, index) => {
    const x = paddingLeft + index * stepX;
    const normalized = (p.y - minY) / rangeY;
    const y = innerHeight - normalized * innerHeight;
    return { x, y };
  });

  const d = pathPoints.map((p, index) => {
    const cmd = index === 0 ? "M" : "L";
    return `${cmd}${p.x},${p.y}`;
  }).join(" ");

  const labels = showXAxis
    ? pathPoints.map((p, index) => {
      const label = points[index].x;
      return `
      <text
        x="${p.x}"
        y="${height - 2}"
        fill="#8b949e"
        font-size="${labelFontSize}"
        text-anchor="middle">
        ${escapeText(label)}
      </text>`;
    }).join("")
    : "";

  return `
    <g>
      ${showXAxis ? `
      <line
        x1="${paddingLeft}"
        y1="${innerHeight}"
        x2="${width - paddingRight}"
        y2="${innerHeight}"
        stroke="${axisColor}"
        stroke-width="1"
      />` : ""}
      <path
        d="${d}"
        fill="none"
        stroke="${color}"
        stroke-width="${strokeWidth}"
      />
      ${labels}
    </g>
    `;
}

/**
 * ==========================================================
 * TIMELINE BARS
 *
 * Used for compact bar timelines, e.g.
 * - Weekday commit activity
 *
 * Example data: [{ label: "Mon", value: 10 }, ...]
 * ==========================================================
 */
function timelineBars(data = [], options = {}) {
  const {
    labelX = 0,
    barX = 40,
    maxBarWidth = 160,
    rowHeight = 18,
    barHeight = 8,
    barRadius = 4,
    labelFontSize = 12,
    barColor = "#58a6ff",
    barBgColor = "#30363d",
  } = options;

  const items = (Array.isArray(data) ? data : [])
    .map(d => ({ label: d.label, value: Number(d.value) || 0 }));

  if (!items.length) {
    return "";
  }

  const maxValue = Math.max(...items.map(i => i.value), 1);

  const rows = items.map((item, index) => {
    const y = index * rowHeight;
    const width = (item.value / maxValue) * maxBarWidth;

    return `
      <text
        x="${labelX}"
        y="${y + rowHeight - 6}"
        fill="#c9d1d9"
        font-size="${labelFontSize}">
        ${escapeText(item.label || "")}
      </text>

      <rect
        x="${barX}"
        y="${y + rowHeight - barHeight - 4}"
        width="${maxBarWidth}"
        height="${barHeight}"
        rx="${barRadius}"
        fill="${barBgColor}"
      />

      <rect
        x="${barX}"
        y="${y + rowHeight - barHeight - 4}"
        width="${width}"
        height="${barHeight}"
        rx="${barRadius}"
        fill="${barColor}"
      />
    `;
  }).join("");

  return `
    <g>
      ${rows}
    </g>
    `;
}

/**
 * ==========================================================
 * MULTI PROGRESS BARS
 *
 * Used for multiple progress bars in WakaTime style.
 * Example data: [{ label: "JavaScript", value: 40 }, ...]
 * ==========================================================
 */
function multiProgressBars(data = [], options = {}) {
  const {
    labelX = 0,
    barX = 120,
    maxBarWidth = 160,
    rowHeight = 24,
    barHeight = 8,
    barRadius = 4,
    labelFontSize = 12,
    barColor = "#58a6ff",
    barBgColor = "#30363d",
    showPercentage = true,
    theme = null,
  } = options;

  // Use theme colors if provided
  const colors = theme && theme.colors ? theme.colors : {
    text: "#c9d1d9",
    subText: "#8b949e",
    bar1: "#58a6ff",
    barBg1: "#30363d"
  };

  const items = (Array.isArray(data) ? data : [])
    .map(d => ({ label: d.label, value: Number(d.value) || 0 }));

  if (!items.length) {
    return "";
  }

  const maxValue = Math.max(...items.map(i => i.value), 1);

  const rows = items.map((item, index) => {
    const y = index * rowHeight;
    const width = (item.value / maxValue) * maxBarWidth;

    return `
      <text
        x="${labelX}"
        y="${y + rowHeight - 6}"
        fill="${colors.text}"
        font-size="${labelFontSize}">
        ${escapeText(item.label || "")}
      </text>

      <rect
        x="${barX}"
        y="${y + rowHeight - barHeight - 4}"
        width="${maxBarWidth}"
        height="${barHeight}"
        rx="${barRadius}"
        fill="${barBgColor}"
      />

      <rect
        x="${barX}"
        y="${y + rowHeight - barHeight - 4}"
        width="${width}"
        height="${barHeight}"
        rx="${barRadius}"
        fill="${barColor}"
      />
      
      ${showPercentage ? `
      <text
        x="${barX + maxBarWidth + 8}"
        y="${y + rowHeight - 6}"
        fill="${colors.subText}"
        font-size="${labelFontSize - 1}"
        text-anchor="start">
        ${Math.round((item.value / maxValue) * 100)}%
      </text>` : ""}
    `;
  }).join("");

  return `
    <g>
      ${rows}
    </g>
    `;
}

/**
 * ==========================================================
 * METRIC GRID
 *
 * Used for 2-column grid of metrics.
 * Example data: [{ label: "Current Streak", value: 12 }, ...]
 * ==========================================================
 */
function metricGrid(metrics = [], options = {}) {
  const {
    labelX = 0,
    valueX = 200,
    rowHeight = 20,
    labelFontSize = 12,
    valueFontSize = 14,
    labelColor = "#c9d1d9",
    valueColor = "#ffffff",
    fontWeight = "600",
  } = options;

  const items = (Array.isArray(metrics) ? metrics : [])
    .map(m => ({ label: m.label, value: m.value }));

  if (!items.length) {
    return "";
  }

  const rows = items.map((item, index) => {
    const y = index * rowHeight;
    return `
        <text
            x="${labelX}"
            y="${y + rowHeight - 6}"
            fill="${labelColor}"
            font-size="${labelFontSize}">
            ${escapeText(item.label || "")}
        </text>
        <text
            x="${valueX}"
            y="${y + rowHeight - 6}"
            fill="${valueColor}"
            font-size="${valueFontSize}"
            font-weight="${fontWeight}"
            text-anchor="end">
            ${escapeText(String(item.value || ""))}
        </text>
    `;
  }).join("");

  return `
    <g>
      ${rows}
    </g>
    `;
}

/**
 * ==========================================================
 * MINI LEGEND
 *
 * Used for small legends with donut charts.
 * Example data: [{ label: "JavaScript", color: "#f1e05a" }]
 * ==========================================================
 */
function miniLegend(items = [], options = {}) {
  const {
    startX = 0,
    startY = 0,
    itemWidth = 80,
    rowHeight = 16,
    dotSize = 8,
    fontSize = 11,
    labelColor = "#c9d1d9",
  } = options;

  const legendItems = (Array.isArray(items) ? items : [])
    .map(item => ({ label: item.label, color: item.color }));

  if (!legendItems.length) {
    return "";
  }

  const rows = legendItems.map((item, index) => {
    const x = startX + (index % 2) * itemWidth;
    const y = startY + Math.floor(index / 2) * rowHeight;

    return `
        <circle
            cx="${x + dotSize / 2}"
            cy="${y + rowHeight / 2}"
            r="${dotSize / 2}"
            fill="${item.color}"
        />
        <text
            x="${x + dotSize + 4}"
            y="${y + rowHeight / 2 + 3}"
            fill="${labelColor}"
            font-size="${fontSize}">
            ${escapeText(item.label || "")}
        </text>
    `;
  }).join("");

  return `
    <g>
      ${rows}
    </g>
    `;
}

module.exports = {
  statRow,
  progressBar,
  languageRow,
  repoRow,
  sectionLabel,
  createRowGrid,
  donutChart,
  sparkline,
  lineChart,
  timelineBars,
  multiProgressBars,
  metricGrid,
  miniLegend,
};