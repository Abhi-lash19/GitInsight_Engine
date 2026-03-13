const { getTheme } = require("../themes");
const { renderCard } = require("./cardRenderer");
const { createDashboardLayout } = require("./layoutEngine");
const { getAllCards } = require("../plugins/cardRegistry");
const { loadPlugins } = require("../plugins/loadPlugins");

// Typographic system for the dashboard
const TITLE_SIZE = 26;
const CARD_TITLE_SIZE = 17;
const LABEL_SIZE = 13;
const CAPTION_SIZE = 12;

// Consistent inner padding for card content groups
const CONTENT_PADDING_X = 20;
const CONTENT_PADDING_TOP = 50;

// Ensure built-in plugins are registered once at module load time.
loadPlugins();

/**
 * Render the README dashboard using the plugin registry.
 *
 * Plugin lifecycle:
 *  load (loadPlugins) → register (cardRegistry) →
 *  fetchData(stats) → renderContent(data) → renderCard(stats?).
 *
 * The existing card generators remain untouched; this function simply
 * asks plugins to provide their content and uses the layout engine to
 * place them into a grid while preserving the existing visual style.
 */
function renderReadmeDashboard(stats, options = {}) {

    const { theme = "dark" } = options;
    const { colors } = getTheme(theme);

    const safeStats = stats?.stats || stats?.data || stats || {};

    const width = 900;

    const padding = 32;
    const titleY = 48;

    // Two-column grid mirroring the previous manual layout.
    const layout = createDashboardLayout({
        startX: padding,
        startY: 70,
        cardWidth: 390,
        columnGap: 36,
        rowGap: 30,
        columns: 2,
    });

    // Helper to wrap dashboard content in a translated group.
    const wrapContent = (inner) => `
<g transform="translate(${CONTENT_PADDING_X},${CONTENT_PADDING_TOP})" fill="${colors.text}" font-size="${LABEL_SIZE}">
${inner}
</g>`;

    const plugins = getAllCards();

    const cardsSvg = plugins.map((plugin) => {
        if (!plugin || typeof plugin.fetchData !== "function" || typeof plugin.renderContent !== "function") {
            // eslint-disable-next-line no-console
            console.warn(
                "[GitInsight][plugins] Skipping misconfigured plugin:",
                plugin && plugin.id
            );
            return "";
        }

        let data;
        try {
            data = plugin.fetchData(safeStats);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
                `[GitInsight][plugins] fetchData() failed for plugin '${plugin.id}':`,
                err && err.message
            );
            return "";
        }

        let rawContent;
        try {
            rawContent = plugin.renderContent(data, { theme });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
                `[GitInsight][plugins] renderContent() failed for plugin '${plugin.id}':`,
                err && err.message
            );
            return "";
        }

        const span = plugin.layout && plugin.layout.span > 1 ? plugin.layout.span : 1;

        // Base heights are intentionally kept close to the original manual layout.
        const baseHeight = plugin.layout && plugin.layout.height
            ? plugin.layout.height
            : 140;

        const frame = layout.place(baseHeight, span);

        const content = wrapContent(rawContent);

        return renderCard({
            ...frame,
            title: plugin.title,
            colors: {
                ...colors,
                // Ensure card titles use the shared typography system.
                titleFontSize: CARD_TITLE_SIZE,
            },
            content,
        });
    }).join("");

    const contentBottom = layout.getHeight();
    const height = contentBottom + padding;

    return `
<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">

<rect width="100%" height="100%" rx="20" fill="${colors.cardBg}" stroke="${colors.border}" />

<text x="${padding}" y="${titleY}" fill="${colors.title}" font-size="${TITLE_SIZE}" font-weight="700">
🚀 GitInsight Profile
</text>

${cardsSvg}

</svg>
`;
}

module.exports = { renderReadmeDashboard };