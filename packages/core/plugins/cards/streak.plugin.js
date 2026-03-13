/**
 * Streak Card Plugin
 *
 * Wraps the streak card generator so it can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderStreakCard,
    renderStreakContent,
} = require("../../generators/streakCard");

module.exports = {
    id: "streak",
    title: "Contribution Streak",
    order: 22,
    height: 140,

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
        return renderStreakContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderStreakCard(stats, options);
    },
};
