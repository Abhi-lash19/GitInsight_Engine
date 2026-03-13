/**
 * Commit Activity by Weekday
 *
 * Groups commits into weekday buckets for timeline visualizations.
 */

const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function createEmptyActivity() {
    return {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
    };
}

function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Group commits by weekday.
 *
 * @param {Array<{date:string}>} commits
 * @returns {{Monday:number,Tuesday:number,Wednesday:number,Thursday:number,Friday:number,Saturday:number,Sunday:number}}
 */
function getCommitActivity(commits) {
    if (!Array.isArray(commits) || commits.length === 0) {
        return createEmptyActivity();
    }

    const activity = createEmptyActivity();

    commits.forEach((commit) => {
        const date = parseDate(commit && commit.date);
        if (!date) return;

        const dayIndex = date.getUTCDay(); // 0-6, Sunday=0
        const name = WEEKDAYS[dayIndex];

        if (Object.prototype.hasOwnProperty.call(activity, name)) {
            activity[name] += 1;
        }
    });

    return activity;
}

module.exports = { getCommitActivity };

