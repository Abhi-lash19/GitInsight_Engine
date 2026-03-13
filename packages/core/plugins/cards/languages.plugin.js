/**
 * Languages Card Plugin
 *
 * Wraps the existing language card generators.
 */

const {
    renderLanguageCard,
    renderLanguageContent,
} = require("../../generators/languageCard");

module.exports = {
    id: "languages",
    title: "Languages",
    order: 5,

    /**
     * Language cards only need the languages map.
     */
    fetchData(stats) {
        return stats?.languages || {};
    },

    /**
     * Render dashboard content fragment (no container).
     */
    renderContent(languages) {
        return renderLanguageContent(languages);
    },

    /**
     * Render standalone SVG card.
     */
    renderCard(stats, options) {
        return renderLanguageCard(stats?.languages || {}, options);
    },
};

