const { createCard } = require("./svgGenerator");
const { lineChart, metricGrid } = require("./components");
const { getCommitTrends } = require("../analytics/commitTrends");

/**
 * Dashboard renderer for activity graph
 */
function renderActivityGraphContent(stats) {
    const trends = getCommitTrends(stats.contributions, { limitWeeks: 16 });

    if (!trends.length) {
        return `
            <text x="0" y="20" fill="#c9d1d9" font-size="13">
                No activity data available
            </text>
        `;
    }

    const chartData = trends.map(trend => ({
        x: trend.week.split('-W')[1], // Extract week number
        y: trend.commits
    }));

    const totalCommits = trends.reduce((sum, trend) => sum + trend.commits, 0);
    const avgCommits = Math.round(totalCommits / trends.length);
    const maxCommits = Math.max(...trends.map(t => t.commits));

    const metrics = [
        { label: "Total (16w)", value: totalCommits },
        { label: "Average", value: `${avgCommits}/week` },
        { label: "Peak", value: `${maxCommits}/week` }
    ];

    return `
        ${metricGrid(metrics, {
        labelFontSize: 12,
        valueFontSize: 14,
        rowHeight: 20
    })}
        ${lineChart(chartData, {
        width: 280,
        height: 80,
        color: "#238636"
    })}
    `;
}

/**
 * Standalone card
 */
function renderActivityGraphCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const trends = getCommitTrends(stats.contributions, { limitWeeks: 16 });

    if (!trends.length) {
        return createCard({
            title: "Activity Graph",
            lines: ["No activity data available"],
            themeName: theme,
        });
    }

    const totalCommits = trends.reduce((sum, trend) => sum + trend.commits, 0);
    const avgCommits = Math.round(totalCommits / trends.length);
    const maxCommits = Math.max(...trends.map(t => t.commits));

    const lines = [
        `Total (16w): ${totalCommits} commits`,
        `Average: ${avgCommits}/week`,
        `Peak: ${maxCommits}/week`
    ];

    return createCard({
        title: "Activity Graph",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderActivityGraphCard,
    renderActivityGraphContent
};
