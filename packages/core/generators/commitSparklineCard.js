const { createCard } = require("./svgGenerator");
const { sparkline, metricGrid } = require("./components");
const { getCommitTrends } = require("../analytics/commitTrends");

/**
 * Dashboard renderer for commit sparkline
 */
function renderCommitSparklineContent(stats) {
    const trends = getCommitTrends(stats.contributions, { limitWeeks: 12 });

    if (!trends.length) {
        return `
            <text x="0" y="20" fill="#c9d1d9" font-size="13">
                No commit data available
            </text>
        `;
    }

    const commitCounts = trends.map(t => t.commits);
    const maxCommits = Math.max(...commitCounts);
    const totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);
    const avgCommits = Math.round(totalCommits / commitCounts.length);

    const metrics = [
        { label: "Last 12 weeks", value: totalCommits },
        { label: "Average", value: `${avgCommits}/week` },
        { label: "Peak", value: `${maxCommits}/week` }
    ];

    return `
        ${metricGrid(metrics, {
        labelFontSize: 12,
        valueFontSize: 14,
        rowHeight: 20
    })}
        ${sparkline(commitCounts, {
        width: 280,
        height: 60,
        color: "#58a6ff"
    })}
    `;
}

/**
 * Standalone card
 */
function renderCommitSparklineCard(stats, options = {}) {
    const { theme = "dark" } = options;
    const trends = getCommitTrends(stats.contributions, { limitWeeks: 12 });

    if (!trends.length) {
        return createCard({
            title: "Commit Trend",
            lines: ["No commit data available"],
            themeName: theme,
        });
    }

    const commitCounts = trends.map(t => t.commits);
    const maxCommits = Math.max(...commitCounts);
    const totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);
    const avgCommits = Math.round(totalCommits / commitCounts.length);

    const lines = [
        `Last 12 weeks: ${totalCommits} commits`,
        `Average: ${avgCommits}/week`,
        `Peak: ${maxCommits}/week`
    ];

    return createCard({
        title: "Commit Trend",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderCommitSparklineCard,
    renderCommitSparklineContent
};
