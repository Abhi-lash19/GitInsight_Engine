require("dotenv").config();

const Fastify = require("fastify");
const fastifyCors = require("@fastify/cors");

const { computeStats } = require("../../packages/core/application/computeStats");
const { renderOverviewCard } = require("../../packages/core/generators/overviewCard");
const { renderLanguageCard } = require("../../packages/core/generators/languageCard");
const { renderCommitsCard } = require("../../packages/core/generators/commitsCard");
const { renderCodeStatsCard } = require("../../packages/core/generators/codeStatsCard");
const { renderInsightsCard } = require("../../packages/core/generators/insightsCard");
const { renderHeatmapCard } = require("../../packages/core/generators/heatmapCard");
const { getStats } = require("../../packages/core/application/statsService");
const { getApiCache, setApiCache } = require("../../packages/core/cache/cacheManager");
const { getSvgCard } = require("../../packages/core/services/svgCacheService");
const { renderReadmeDashboard } = require("../../packages/core/generators/readmeDashboardCard");

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: true });

function setCachingHeaders(reply, body) {
    const etag = `"${Buffer.from(JSON.stringify(body)).toString("base64").slice(0, 32)}"`;

    ```
reply.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=30");
reply.header("ETag", etag);
reply.header("Last-Modified", new Date().toUTCString());
```

}

function parseOptions(query) {
    return {
        theme: query.theme || "dark",
        hide: query.hide ? query.hide.split(",") : [],
        compact: query.compact === "true",
        animate: query.animate !== "false",
    };
}

/**

* Normalize stats objects from different sources
  */
function normalizeStats(obj) {
    let s = obj;

    if (s?.stats) s = s.stats;
    if (s?.data) s = s.data;
    if (s?.data?.data) s = s.data.data;

    return s;
}

/**

* Normalize stats response
* getStats() may return { stats } or direct stats object
  */
async function resolveStats(username) {
    const result = await getStats(username);
    return normalizeStats(result);
}

function setSvgHeaders(req, reply, svg) {
    const etag = `"${Buffer.from(svg).toString("base64").slice(0, 32)}"`;

    ```
// 304 support
if (req.headers["if-none-match"] === etag) {
    reply.code(304);
    return true;
}

reply.header(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=43200"
);

reply.header("ETag", etag);
reply.header("Content-Type", "image/svg+xml");

return false;
```

}

/**

* =========================
* Stats JSON Endpoint
* =========================
  */
fastify.get("/api/v1/stats/:username", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

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
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderOverviewCard(stats, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
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
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderLanguageCard(stats.languages || {}, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* =========================
* Commits Card
* =========================
  */
fastify.get("/api/v1/cards/commits/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:commits:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderCommitsCard(stats, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* =========================
* Code Stats Card
* =========================
  */
fastify.get("/api/v1/cards/codestats/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:codestats:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderCodeStatsCard(stats, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
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
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderInsightsCard(stats, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* =========================
* Heatmap Card
* =========================
  */
fastify.get("/api/v1/cards/heatmap/:username", async (req, reply) => {
    const options = parseOptions(req.query);
    const cacheKey = `card:heatmap:${req.params.username}:${JSON.stringify(options)}`;

    const cached = await getApiCache(cacheKey);
    if (cached) {
        if (setSvgHeaders(req, reply, cached)) return reply.send();
        return reply.send(cached);
    }

    const stats = await resolveStats(req.params.username);
    const svg = renderHeatmapCard(stats, options);

    await setApiCache(cacheKey, svg);
    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**

* =========================
* README Dashboard
* =========================
  */
fastify.get("/readme/:username.svg", async (req, reply) => {

    const options = parseOptions(req.query);

    const stats = await resolveStats(req.params.username);

    const svg = renderReadmeDashboard(stats, options);

    reply.header("Content-Type", "image/svg+xml");
    return reply.send(svg);
});

/**

* =========================
* PUBLIC README WIDGET ROUTES
* =========================
* Optimized for GitHub README embedding
* Uses same SVG cache as API routes
  */

/**
* Overview Card
  */
fastify.get("/overview/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

    const svg = await getSvgCard(req.params.username, "overview", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* Languages Card
  */
fastify.get("/languages/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

    const svg = await getSvgCard(req.params.username, "languages", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* Commits Card
  */
fastify.get("/commits/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

    const svg = await getSvgCard(req.params.username, "commits", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* Code Stats Card
  */
fastify.get("/codestats/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);
    const svg = await getSvgCard(req.params.username, "codestats", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* Insights Card
  */
fastify.get("/insights/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

    const svg = await getSvgCard(req.params.username, "insights", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

/**
* Heatmap Card
  */
fastify.get("/heatmap/:username.svg", async (req, reply) => {
    const stats = await resolveStats(req.params.username);

    const svg = await getSvgCard(req.params.username, "heatmap", stats);

    if (setSvgHeaders(req, reply, svg)) return reply.send();
    return reply.send(svg);
});

fastify.listen({ port: 3000, host: "0.0.0.0" })
    .then(() => console.log("🚀 API running at http://localhost:3000"))
    .catch(console.error);