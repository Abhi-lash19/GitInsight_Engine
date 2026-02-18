require("dotenv").config();

const Fastify = require("fastify");
const fastifyCors = require("@fastify/cors");

const { computeStats } = require("../../packages/core/application/computeStats");
const { renderOverviewCard } = require("../../packages/core/generators/overviewCard");
const { renderLanguageCard } = require("../../packages/core/generators/languageCard");
const { getApiCache, setApiCache } = require("../../packages/core/cache/cacheManager");

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: true });

function parseOptions(query) {
    return {
        theme: query.theme || "dark",
        hide: query.hide ? query.hide.split(",") : [],
        compact: query.compact === "true",
        animate: query.animate !== "false",
    };
}

fastify.get("/api/v1/stats/:username", async (req) => {
    const key = `api:stats:${req.params.username}`;
    const cached = await getApiCache(key);
    if (cached) return cached;

    const stats = await computeStats(req.params.username);

    const payload = {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        data: stats,
    };

    await setApiCache(key, payload);
    return payload;
});

fastify.get("/api/v1/cards/overview/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:overview:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) return reply.type("image/svg+xml").send(cached);

    const stats = await computeStats(req.params.username);
    const svg = renderOverviewCard(stats, options);

    await setApiCache(cacheKey, svg);
    reply.type("image/svg+xml").send(svg);
});

fastify.get("/api/v1/cards/languages/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:lang:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) return reply.type("image/svg+xml").send(cached);

    const stats = await computeStats(req.params.username);
    const svg = renderLanguageCard(stats.languages, options);

    await setApiCache(cacheKey, svg);
    reply.type("image/svg+xml").send(svg);
});

fastify.listen({ port: 3000, host: "0.0.0.0" })
    .then(() => console.log("🚀 API running at http://localhost:3000"))
    .catch(console.error);
