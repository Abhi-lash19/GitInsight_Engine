/**
 * Impact Card Plugin
 *
 * Wraps the existing repo impact card generators.
 */

const {
    renderImpactCard,
    renderImpactContent,
} = require("../../generators/impactCard");

module.exports = {
    id: "impact",
    title: "Repo Impact",
    order: 7,

    /**
     * Impact operates on the full stats object to access
     * `stats.repoImpact` safely.
     */
    fetchData(stats) {
        return stats;
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(data) {
        return renderImpactContent(data);
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderImpactCard(stats, options);
    },
};

