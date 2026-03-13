/**
 * Card Registry
 *
 * Central in-memory registry for dashboard card plugins.
 * Uses a Map internally so lookups are O(1) and insertion
 * order is preserved for deterministic iteration.
 */

const registry = new Map();

/**
 * Register a card plugin.
 *
 * This performs light validation of the plugin interface and
 * protects against duplicate registration of the same id.
 *
 * @param {object} plugin - Card plugin implementing the card interface.
 * @throws {Error} If the plugin is missing required fields.
 */
function registerCard(plugin) {
    if (!plugin || typeof plugin !== "object") {
        throw new Error("registerCard() expects a plugin object.");
    }

    const { id, title, order, fetchData, renderContent, renderCard } = plugin;

    if (typeof id !== "string" || !id.trim()) {
        throw new Error("Card plugin must define a non-empty string 'id'.");
    }

    if (typeof title !== "string" || !title.trim()) {
        throw new Error(`Card plugin '${id}' must define a non-empty 'title'.`);
    }

    if (typeof order !== "number") {
        throw new Error(`Card plugin '${id}' must define numeric 'order'.`);
    }

    if (typeof fetchData !== "function") {
        throw new Error(`Card plugin '${id}' must provide 'fetchData(stats)'.`);
    }

    if (typeof renderContent !== "function") {
        throw new Error(`Card plugin '${id}' must provide 'renderContent(data)'.`);
    }

    if (typeof renderCard !== "function") {
        throw new Error(`Card plugin '${id}' must provide 'renderCard(stats)'.`);
    }

    if (registry.has(id)) {
        // Avoid overriding an existing plugin in production; later
        // registrations may indicate configuration problems.
        // eslint-disable-next-line no-console
        console.warn(
            `[GitInsight][plugins] Duplicate card registration for id '${id}' – existing plugin will be kept.`
        );
        return;
    }

    registry.set(id, plugin);
}

/**
 * Retrieve a single card plugin by id.
 *
 * @param {string} id - Card identifier.
 * @returns {object|undefined} The registered plugin or undefined.
 */
function getCard(id) {
    return registry.get(id);
}

/**
 * Retrieve all registered card plugins, sorted by plugin.order.
 *
 * The returned array is a shallow clone to ensure callers cannot
 * mutate internal registry state.
 *
 * @returns {object[]} Array of plugins sorted by ascending `order`.
 */
function getAllCards() {
    return Array.from(registry.values()).sort((a, b) => {
        const ao = typeof a.order === "number" ? a.order : 0;
        const bo = typeof b.order === "number" ? b.order : 0;
        return ao - bo;
    });
}

module.exports = {
    registerCard,
    getCard,
    getAllCards,
};

