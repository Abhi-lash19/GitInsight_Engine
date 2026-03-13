/**
 * Overview Card Plugin
 *
 * Wraps the existing overview card generators so they can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderOverviewCard,
    renderOverviewContent,
} = require("../../generators/overviewCard");

module.exports = {
    id: "overview",
    title: "TEST OVERVIEW",
    order: 10,

    /**
     * Extract the slice of stats this card cares about.
     * For overview we keep the full stats object.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderOverviewContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderOverviewCard(stats, options);
    },
};

