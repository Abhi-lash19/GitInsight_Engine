/**
 * Commit Timeline Card Plugin
 *
 * Wraps the commit timeline card generator so it can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderCommitTimelineCard,
    renderCommitTimelineContent,
} = require("../../generators/commitTimelineCard");

module.exports = {
    id: "commitTimeline",
    title: "Commit Activity Timeline",
    order: 23,
    height: 150,

    /**
     * Extract the slice of stats this card cares about.
     */
    fetchData(stats) {
        return {
            commits: stats.commits || []
        };
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderCommitTimelineContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderCommitTimelineCard(stats, options);
    },
};
