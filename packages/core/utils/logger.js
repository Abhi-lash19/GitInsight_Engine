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
        this.cacheStatus = null; // null until explicitly set
    }

    /**
     * Start a stage timer
     */
    startStage(name) {
        return { name, start: now() };
    }

    /**
     * End a stage timer
     */
    endStage(stage) {
        const duration = diffMs(stage.start);

        this.stages.push({
            name: stage.name,
            duration,
        });

        return duration;
    }

    /**
     * Explicit cache state markers
     */
    markCacheHit() {
        this.cacheStatus = "HIT";
    }

    markCacheMiss() {
        this.cacheStatus = "MISS";
    }

    /**
     * Print structured execution summary
     */
    printSummary() {
        const total = diffMs(this.totalStart);

        console.log("\nExecution Summary");
        console.log("────────────────────────────");

        if (this.stages.length === 0) {
            console.log("[INFO] No stages recorded");
        } else {
            let slowest = { name: "", duration: 0 };

            this.stages.forEach(s => {
                if (s.duration > slowest.duration) {
                    slowest = s;
                }

                const padded = s.name.padEnd(30, ".");
                console.log(
                    `[STAGE] ${padded} ${Math.round(s.duration)}ms`
                );
            });

            console.log("");
            console.log(
                `[INFO] Slowest Stage: ${slowest.name} (${Math.round(
                    slowest.duration
                )}ms)`
            );
        }

        const finalCacheState = this.cacheStatus || "MISS";

        console.log("");
        console.log(`[RESULT] Cache: ${finalCacheState}`);
        console.log(`[RESULT] Total Time: ${Math.round(total)}ms\n`);
    }
}

module.exports = {
    PerfLogger,
};