/**
 * Repo Growth Analytics
 *
 * Pure helper to derive growth-related statistics for a single repo.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Calculate repository growth metrics.
 *
 * @param {{stars?:number,forks?:number,createdAt?:string}|undefined} repo
 * @returns {{starsGrowth:number,forksGrowth:number,repoAgeDays:number,growthScore:number}}
 */
function getRepoGrowth(repo) {
    if (!repo || typeof repo !== "object") {
        return {
            starsGrowth: 0,
            forksGrowth: 0,
            repoAgeDays: 0,
            growthScore: 0,
        };
    }

    const stars = Number(repo.stars) || 0;
    const forks = Number(repo.forks) || 0;

    const created = parseDate(repo.createdAt);
    if (!created) {
        return {
            starsGrowth: 0,
            forksGrowth: 0,
            repoAgeDays: 0,
            growthScore: 0,
        };
    }

    const now = new Date();
    const diffMs = Math.max(0, now - created);
    const ageDays = Math.max(1, Math.floor(diffMs / DAY_MS));

    const starsGrowth = stars / ageDays;
    const forksGrowth = forks / ageDays;
    const growthScore = (stars + forks) / ageDays;

    return {
        starsGrowth,
        forksGrowth,
        repoAgeDays: ageDays,
        growthScore,
    };
}

module.exports = { getRepoGrowth };

