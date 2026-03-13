/**
 * Activity Graph Card Plugin
 *
 * Wraps the activity graph card generator so it can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderActivityGraphCard,
    renderActivityGraphContent,
} = require("../../generators/activityGraphCard");

module.exports = {
    id: "activityGraph",
    title: "Activity Graph",
    order: 24,
    height: 160,

    /**
     * Extract the slice of stats this card cares about.
     */
    fetchData(stats) {
        return {
            contributions: stats.contributions || []
        };
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderActivityGraphContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderActivityGraphCard(stats, options);
    },
};
