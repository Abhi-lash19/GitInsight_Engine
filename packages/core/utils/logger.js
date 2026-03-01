function now() {
    return process.hrtime.bigint();
}

function diffMs(start) {
    return Number(process.hrtime.bigint() - start) / 1e6;
}

class PerfLogger {
    constructor() {
        this.stages = [];
        this.totalStart = now();
        this.cacheStatus = "MISS";
    }

    startStage(name) {
        return { name, start: now() };
    }

    endStage(stage) {
        const duration = diffMs(stage.start);
        this.stages.push({ name: stage.name, duration });
        return duration;
    }

    markCacheHit() {
        this.cacheStatus = "HIT";
    }

    printSummary() {
        const total = diffMs(this.totalStart);

        console.log("\nExecution Summary");
        console.log("────────────────────────────");

        this.stages.forEach(s => {
            const padded = s.name.padEnd(30, ".");
            console.log(`[STAGE] ${padded} ${Math.round(s.duration)}ms`);
        });

        console.log("");
        console.log(`[RESULT] Cache: ${this.cacheStatus}`);
        console.log(`[RESULT] Total Time: ${Math.round(total)}ms\n`);
    }
}

module.exports = {
    PerfLogger,
};