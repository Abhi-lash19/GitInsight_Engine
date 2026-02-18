const Redis = require("ioredis");

let redis;

try {
    redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        lazyConnect: true,
    });

    redis.on("error", () => {
        console.log("⚠️ Redis unavailable, falling back to memory cache");
        redis = null;
    });

} catch {
    redis = null;
}

module.exports = { redis };
