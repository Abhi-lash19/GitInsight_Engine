/**
 * Insights Card Plugin
 *
 * Wraps the existing insights card generators.
 */

const {
    renderInsightsCard,
    renderInsightsContent,
} = require("../../generators/insightsCard");

module.exports = {
    id: "insights",
    title: "Developer Insights",
    order: 2,

    /**
     * Insights operate on the full stats object.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderInsightsContent(data);
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderInsightsCard(stats, options);
    },
};

