/**
 * Code Stats Card Plugin
 *
 * Wraps the existing code statistics card generators.
 */

const {
    renderCodeStatsCard,
    renderCodeStatsContent,
} = require("../../generators/codeStatsCard");

module.exports = {
    id: "codestats",
    title: "Code Activity",
    order: 3,

    /**
     * Code statistics operate on the full stats object so
     * they can pull `stats.codeStats` internally.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderCodeStatsContent(data);
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderCodeStatsCard(stats, options);
    },
};

