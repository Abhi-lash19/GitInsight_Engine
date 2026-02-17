require("dotenv").config();

const Fastify = require("fastify");
const fastifyCors = require("@fastify/cors");

const { computeStats } = require("../../packages/core/application/computeStats");
const { renderOverviewCard } = require("../../packages/core/generators/overviewCard");
const { renderLanguageCard } = require("../../packages/core/generators/languageCard");

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
    const stats = await computeStats(req.params.username);

    return {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        data: stats,
    };
});

fastify.get("/api/v1/cards/overview/:username", async (req, reply) => {
    const stats = await computeStats(req.params.username);
    const options = parseOptions(req.query);

    const svg = renderOverviewCard(stats, options);

    reply.type("image/svg+xml").send(svg);
});

fastify.get("/api/v1/cards/languages/:username", async (req, reply) => {
    const stats = await computeStats(req.params.username);
    const options = parseOptions(req.query);

    const svg = renderLanguageCard(stats.languages, options);

    reply.type("image/svg+xml").send(svg);
});

fastify.listen({ port: 3000, host: "0.0.0.0" })
    .then(() => console.log("🚀 API running at http://localhost:3000"))
    .catch(console.error);
