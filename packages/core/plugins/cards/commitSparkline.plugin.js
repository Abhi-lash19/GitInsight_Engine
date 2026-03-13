/**
 * Commit Sparkline Card Plugin
 *
 * Wraps the commit sparkline card generator so it can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderCommitSparklineCard,
    renderCommitSparklineContent,
} = require("../../generators/commitSparklineCard");

module.exports = {
    id: "commitSparkline",
    title: "Commit Trend",
    order: 20,
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
        return renderCommitSparklineContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderCommitSparklineCard(stats, options);
    },
};
