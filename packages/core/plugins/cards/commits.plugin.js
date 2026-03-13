/**
 * Commits Card Plugin
 *
 * Wraps the existing commits card generators.
 */

const {
    renderCommitsCard,
    renderCommitsContent,
} = require("../../generators/commitsCard");

module.exports = {
    id: "commits",
    title: "Commit Distribution",
    order: 4,

    /**
     * Commits card works with the full stats object.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderCommitsContent(data);
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderCommitsCard(stats, options);
    },
};

