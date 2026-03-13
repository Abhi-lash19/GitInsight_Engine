const { createCard } = require("./svgGenerator");
const { timelineBars } = require("./components");
const { getCommitActivity } = require("../analytics/commitActivity");

/**
 * Dashboard renderer for commit activity timeline
 */
function renderCommitTimelineContent(stats) {
    const activity = getCommitActivity(stats.commits);

    const weekdayData = [
        { label: "Mon", value: activity.Monday },
        { label: "Tue", value: activity.Tuesday },
        { label: "Wed", value: activity.Wednesday },
        { label: "Thu", value: activity.Thursday },
        { label: "Fri", value: activity.Friday },
        { label: "Sat", value: activity.Saturday },
        { label: "Sun", value: activity.Sunday }
    ];

    return timelineBars(weekdayData, {
        maxBarWidth: 120,
        barColor: "#388bfd"
    });
}

/**
 * Standalone card
 */
function renderCommitTimelineCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const activity = getCommitActivity(stats.commits);

    const lines = [
        `Monday: ${activity.Monday} commits`,
        `Tuesday: ${activity.Tuesday} commits`,
        `Wednesday: ${activity.Wednesday} commits`,
        `Thursday: ${activity.Thursday} commits`,
        `Friday: ${activity.Friday} commits`,
        `Saturday: ${activity.Saturday} commits`,
        `Sunday: ${activity.Sunday} commits`
    ];

    return createCard({
        title: "Commit Activity Timeline",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderCommitTimelineCard,
    renderCommitTimelineContent
};
