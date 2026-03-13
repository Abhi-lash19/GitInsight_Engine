/**
 * Contribution Streak Calculator
 *
 * Pure helper that derives streak metrics from daily
 * contribution entries.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Calculate contribution streak metrics.
 *
 * @param {Array<{date:string,count:number}>} contributions
 * @returns {{currentStreak:number,longestStreak:number,totalActiveDays:number}}
 */
function calculateStreak(contributions) {
    if (!Array.isArray(contributions) || contributions.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
        };
    }

    // Normalize and sort by date ascending
    const days = contributions
        .map((entry) => {
            const date = parseDate(entry && entry.date);
            const count = Number(entry && entry.count) || 0;
            if (!date) return null;
            return { date, count };
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);

    if (!days.length) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
        };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let totalActiveDays = 0;

    let prevDate = null;

    days.forEach(({ date, count }) => {
        const active = count > 0;

        if (active) {
            totalActiveDays++;
        }

        if (!prevDate) {
            currentStreak = active ? 1 : 0;
            longestStreak = Math.max(longestStreak, currentStreak);
            prevDate = date;
            return;
        }

        const diffDays = Math.round((date - prevDate) / DAY_MS);

        if (active) {
            if (diffDays === 1 && currentStreak > 0) {
                currentStreak += 1;
            } else {
                currentStreak = 1;
            }
        } else if (diffDays > 1) {
            // Gap without contributions breaks the streak
            currentStreak = 0;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
        prevDate = date;
    });

    return {
        currentStreak,
        longestStreak,
        totalActiveDays,
    };
}

module.exports = { calculateStreak };

