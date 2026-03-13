/**
 * Plugin Loader
 *
 * Loads and registers all built-in dashboard card plugins.
 * This file is the single place where core plugins are wired
 * into the registry, which keeps plugin discovery predictable.
 *
 * Idempotency:
 *  - `loadPlugins()` can be called multiple times safely.
 *  - Duplicate registrations are ignored by the registry.
 */

const { registerCard } = require("./cardRegistry");

// Built-in card plugins (each file wraps an existing generator)
const overviewPlugin = require("./cards/overview.plugin");
const languagesPlugin = require("./cards/languages.plugin");
const insightsPlugin = require("./cards/insights.plugin");
const commitsPlugin = require("./cards/commits.plugin");
const codeStatsPlugin = require("./cards/codestats.plugin");
const heatmapPlugin = require("./cards/heatmap.plugin");
const impactPlugin = require("./cards/impact.plugin");

let loaded = false;

/**
 * Register all built-in plugins.
 *
 * Safe to call multiple times. Only the first invocation performs
 * registration; subsequent calls are no-ops and return the same
 * list of core plugin definitions.
 *
 * @returns {object[]} Array of core plugin definitions.
 */
function loadPlugins() {
    const plugins = [
        overviewPlugin,
        languagesPlugin,
        insightsPlugin,
        commitsPlugin,
        codeStatsPlugin,
        heatmapPlugin,
        impactPlugin,
    ];

    if (loaded) {
        return plugins;
    }

    plugins.forEach((plugin) => {
        try {
            registerCard(plugin);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
                `[GitInsight][plugins] Failed to register plugin '${plugin && plugin.id}':`,
                err && err.message
            );
        }
    });

    loaded = true;

    return plugins;
}

module.exports = { loadPlugins };

