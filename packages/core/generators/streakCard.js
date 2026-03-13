const { createCard } = require("./svgGenerator");
const { metricGrid } = require("./components");
const { calculateStreak } = require("../analytics/streakCalculator");

/**
 * Dashboard renderer for contribution streak
 */
function renderStreakContent(stats) {
    const streak = calculateStreak(stats.contributions);

    const metrics = [
        { label: "Current Streak", value: `${streak.currentStreak} days` },
        { label: "Longest Streak", value: `${streak.longestStreak} days` },
        { label: "Active Days", value: `${streak.totalActiveDays} days` }
    ];

    return metricGrid(metrics, {
        labelFontSize: 12,
        valueFontSize: 14,
        rowHeight: 20
    });
}

/**
 * Standalone card
 */
function renderStreakCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const streak = calculateStreak(stats.contributions);

    const lines = [
        `Current Streak: ${streak.currentStreak} days`,
        `Longest Streak: ${streak.longestStreak} days`,
        `Total Active Days: ${streak.totalActiveDays} days`
    ];

    return createCard({
        title: "Contribution Streak",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderStreakCard,
    renderStreakContent
};
