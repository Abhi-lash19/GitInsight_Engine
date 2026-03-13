/**
 * Commit Trends Analytics
 *
 * Pure helper for aggregating daily contribution data into
 * weekly buckets that can be graphed in cards.
 */

/**
 * Safely parse a date string into a Date instance.
 * Returns null if the input is invalid.
 */
function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Compute ISO week key (e.g. "2024-W01") for a given Date.
 * Uses UTC to keep grouping stable regardless of runtime TZ.
 */
function getIsoWeekKey(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    // Set to nearest Thursday: current date + 4 - current day number
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    const year = d.getUTCFullYear();
    const paddedWeek = String(weekNo).padStart(2, "0");

    return `${year}-W${paddedWeek}`;
}

/**
 * Aggregate daily contributions into weekly commit counts.
 *
 * @param {Array<{date:string,count:number}>} contributions
 * @param {Object} options
 * @param {number} [options.limitWeeks=12] - Maximum number of recent weeks.
 * @returns {Array<{week:string,commits:number}>}
 */
function getCommitTrends(contributions, options = {}) {
    const { limitWeeks = 12 } = options;

    if (!Array.isArray(contributions) || contributions.length === 0) {
        return [];
    }

    const weeks = new Map();

    contributions.forEach((entry) => {
        const date = parseDate(entry && entry.date);
        if (!date) return;

        const count = Number(entry && entry.count) || 0;
        if (count <= 0) return;

        const key = getIsoWeekKey(date);
        const current = weeks.get(key) || 0;
        weeks.set(key, current + count);
    });

    const sortedKeys = Array.from(weeks.keys()).sort();

    const limitedKeys =
        typeof limitWeeks === "number" && limitWeeks > 0
            ? sortedKeys.slice(-limitWeeks)
            : sortedKeys;

    return limitedKeys.map((key) => ({
        week: key,
        commits: weeks.get(key) || 0,
    }));
}

module.exports = { getCommitTrends };

