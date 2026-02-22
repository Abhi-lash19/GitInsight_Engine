#!/usr/bin/env node

const path = require("path");
const fastify = require("fastify")({ logger: true });

const { runCLI } = require("../../packages/core/index");

const { computeStats } = require("../../packages/core/application/computeStats");
const { getApiCache, setApiCache } = require("../../packages/core/cache/cacheManager");

// Insights card generators
const { renderLanguageCard } = require("../../packages/core/generators/languageCard");
const { renderInsightsCard } = require("../../packages/core/generators/insightsCard");

// --------------------
// Local parseOptions (same logic as API server)
// --------------------
function parseOptions(query) {
    return {
        theme: query.theme || "dark",
        hide: query.hide ? query.hide.split(",") : [],
        compact: query.compact === "true",
        animate: query.animate !== "false",
    };
}

// --------------------
// Existing routes
// --------------------

// languages route
fastify.get("/api/v1/cards/languages/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:languages:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) return reply.type("image/svg+xml").send(cached);

    const stats = await computeStats(req.params.username);
    const svg = renderLanguageCard(stats.languages, options);

    await setApiCache(cacheKey, svg);
    reply.type("image/svg+xml").send(svg);
});

// --------------------
// Insights route
// --------------------
fastify.get("/api/v1/cards/insights/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:insights:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) return reply.type("image/svg+xml").send(cached);

    const stats = await computeStats(req.params.username);
    const svg = renderInsightsCard(stats, options);

    await setApiCache(cacheKey, svg);
    reply.type("image/svg+xml").send(svg);
});

// --------------------
// Server start
// --------------------
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port, host: "0.0.0.0" });
        fastify.log.info(`API server running on ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

// CLI passthrough (unchanged)
runCLI();