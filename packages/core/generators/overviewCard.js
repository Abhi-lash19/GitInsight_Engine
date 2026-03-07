const { createCard } = require("./svgGenerator");

/**
 * Generate overview SVG card
 */
function renderOverviewCard(stats, options = {}) {
    const {
        theme = "dark",
        hide = [],
        compact = false,
    } = options;

    const insights = stats.insights || {};
    const codeStats = stats.codeStats || {};

    const lines = [];

    /**
     * =========================
     * Repository Stats
     * =========================
     */
    if (!hide.includes("repos"))
        lines.push(`Repositories: ${stats.totalRepos || 0}`);

    if (!hide.includes("stars"))
        lines.push(`Stars Earned: ${stats.totalStars || 0}`);

    if (!hide.includes("forks"))
        lines.push(`Forks: ${stats.totalForks || 0}`);

    /**
     * =========================
     * Contribution Stats
     * =========================
     */
    if (!hide.includes("contributions"))
        lines.push(`Total Contributions: ${stats.totalContributions || 0}`);

    if (!hide.includes("commits") && insights.totalCommits)
        lines.push(`Commits: ${insights.totalCommits}`);

    /**
     * =========================
     * Code Activity
     * =========================
     */
    if (!compact) {

        if (!hide.includes("lines_added"))
            lines.push(`Lines Added: ${codeStats.totalLinesAdded || 0}`);

        if (!hide.includes("lines_deleted"))
            lines.push(`Lines Deleted: ${codeStats.totalLinesDeleted || 0}`);

        if (!hide.includes("net_lines"))
            lines.push(`Net Lines: ${codeStats.netLines || 0}`);

        /**
         * Productivity Insights
         */
        lines.push(`Productivity Score: ${insights.productivityScore || 0}`);
        lines.push(`Activity Level: ${insights.activityLevel || "N/A"}`);
    }

    return createCard({
        title: "GitInsight Overview",
        lines,
        themeName: theme,
    });
}

module.exports = { renderOverviewCard };