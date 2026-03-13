/**
 * Heatmap Card Plugin
 *
 * Wraps the existing heatmap card generators.
 */

const {
    renderHeatmapCard,
    renderHeatmapContent,
} = require("../../generators/heatmapCard");

module.exports = {
    id: "heatmap",
    title: "Contribution Heatmap",
    order: 6,
    // Layout metadata for the dashboard renderer
    layout: {
        // Occupies both columns in the dashboard grid
        span: 2,
    },

    /**
     * Heatmap uses the full stats object so it can consume
     * commit density from whatever field is available.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     * Theme is forwarded so bucket colors stay consistent.
     */
    renderContent(data, { theme } = {}) {
        return renderHeatmapContent(data, { theme });
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderHeatmapCard(stats, options);
    },
};

