/**
 * Repo Growth Card Plugin
 *
 * Wraps the repo growth card generator so it can be
 * registered and consumed via the plugin-based dashboard system.
 */

const {
    renderRepoGrowthCard,
    renderRepoGrowthContent,
} = require("../../generators/repoGrowthCard");

module.exports = {
    id: "repoGrowth",
    title: "Repository Growth",
    order: 21,
    height: 160,

    /**
     * Extract the slice of stats this card cares about.
     */
    fetchData(stats) {
        return {
            repositories: stats.repositories || []
        };
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderRepoGrowthContent(data);
    },

    /**
     * Render standalone SVG card (used outside dashboard).
     */
    renderCard(stats, options) {
        return renderRepoGrowthCard(stats, options);
    },
};
