require("dotenv").config();

const Fastify = require("fastify");
const fastifyCors = require("@fastify/cors");

const { computeStats } = require("../../packages/core/application/computeStats");
const { renderOverviewCard } = require("../../packages/core/generators/overviewCard");
const { renderLanguageCard } = require("../../packages/core/generators/languageCard");
const { renderCommitsCard } = require("../../packages/core/generators/commitsCard");
const { renderCodeStatsCard } = require("../../packages/core/generators/codeStatsCard");
const { renderInsightsCard } = require("../../packages/core/generators/insightsCard");

const { getApiCache, setApiCache } = require("../../packages/core/cache/cacheManager");

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: true });

function setCachingHeaders(reply, body) {
    const etag = `"${Buffer.from(JSON.stringify(body)).toString("base64").slice(0, 32)}"`;

    reply.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=30");
    reply.header("ETag", etag);
    reply.header("Last-Modified", new Date().toUTCString());
}

function parseOptions(query) {
    return {
        theme: query.theme || "dark",
        hide: query.hide ? query.hide.split(",") : [],
        compact: query.compact === "true",
        animate: query.animate !== "false",
    };
}

function setSvgHeaders(reply, svg) {
    const etag = `"${Buffer.from(svg).toString("base64").slice(0, 32)}"`;

    reply.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=30");
    reply.header("ETag", etag);
    reply.header("Content-Type", "image/svg+xml");
}

/**
 * =========================
 * Stats JSON Endpoint (unchanged)
 * =========================
 */
fastify.get("/api/v1/stats/:username", async (req, reply) => {
    const stats = await computeStats(req.params.username);

    const payload = {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        data: stats,
    };

    setCachingHeaders(reply, payload);
    return payload;
});

/**
 * =========================
 * Overview Card
 * =========================
 */
fastify.get("/api/v1/cards/overview/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:overview:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        setSvgHeaders(reply, cached);
        return reply.send(cached);
    }

    const stats = await computeStats(req.params.username);
    const svg = renderOverviewCard(stats, options);

    await setApiCache(cacheKey, svg);
    setSvgHeaders(reply, svg);
    return reply.send(svg);
});

/**
 * =========================
 * Languages Card
 * =========================
 */
fastify.get("/api/v1/cards/languages/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:lang:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        setSvgHeaders(reply, cached);
        return reply.send(cached);
    }

    const stats = await computeStats(req.params.username);
    const svg = renderLanguageCard(stats.languages, options);

    await setApiCache(cacheKey, svg);
    setSvgHeaders(reply, svg);
    return reply.send(svg);
});

/**
 * =========================
 * Commits Card (unchanged)
 * =========================
 */
fastify.get("/api/v1/cards/commits/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:commits:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        setSvgHeaders(reply, cached);
        return reply.send(cached);
    }

    const stats = await computeStats(req.params.username);
    const svg = renderCommitsCard(stats, options);

    await setApiCache(cacheKey, svg);
    setSvgHeaders(reply, svg);
    return reply.send(svg);
});

/**
 * =========================
 * Code Stats Card (unchanged)
 * =========================
 */
fastify.get("/api/v1/cards/codestats/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:codestats:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        setSvgHeaders(reply, cached);
        return reply.send(cached);
    }

    const stats = await computeStats(req.params.username);
    const svg = renderCodeStatsCard(stats, options);

    await setApiCache(cacheKey, svg);
    setSvgHeaders(reply, svg);
    return reply.send(svg);
});

/**
 * =========================
 * Insights Card
 * =========================
 */
fastify.get("/api/v1/cards/insights/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:insights:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        setSvgHeaders(reply, cached);
        return reply.send(cached);
    }

    const stats = await computeStats(req.params.username);
    const svg = renderInsightsCard(stats, options);

    await setApiCache(cacheKey, svg);
    setSvgHeaders(reply, svg);
    return reply.send(svg);
});

fastify.listen({ port: 3000, host: "0.0.0.0" })
    .then(() => console.log("🚀 API running at http://localhost:3000"))
    .catch(console.error);