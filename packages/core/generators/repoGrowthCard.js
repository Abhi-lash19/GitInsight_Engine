const { createCard } = require("./svgGenerator");
const { lineChart, metricGrid } = require("./components");
const { getRepoGrowth } = require("../analytics/repoGrowth");

/**
 * Dashboard renderer for repo growth
 */
function renderRepoGrowthContent(stats) {
    if (!stats.repositories || !stats.repositories.length) {
        return `
            <text x="0" y="20" fill="#c9d1d9" font-size="13">
                No repository data available
            </text>
        `;
    }

    // Get top 5 repositories by growth score
    const reposWithGrowth = stats.repositories
        .map(repo => ({
            ...repo,
            growth: getRepoGrowth(repo)
        }))
        .sort((a, b) => b.growth.growthScore - a.growth.growthScore)
        .slice(0, 5);

    const chartData = reposWithGrowth.map((repo, index) => ({
        x: repo.name.length > 10 ? repo.name.substring(0, 10) + "..." : repo.name,
        y: Math.round(repo.growth.growthScore * 100) / 100
    }));

    const topRepo = reposWithGrowth[0];
    const metrics = [
        { label: "Top Repo", value: topRepo.name },
        { label: "Growth Score", value: topRepo.growth.growthScore.toFixed(2) },
        { label: "Age", value: `${topRepo.growth.repoAgeDays} days` }
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
        color: "#388bfd"
    })}
    `;
}

/**
 * Standalone card
 */
function renderRepoGrowthCard(stats, options = {}) {
    const { theme = "dark" } = options;

    if (!stats.repositories || !stats.repositories.length) {
        return createCard({
            title: "Repository Growth",
            lines: ["No repository data available"],
            themeName: theme,
        });
    }

    const reposWithGrowth = stats.repositories
        .map(repo => ({
            ...repo,
            growth: getRepoGrowth(repo)
        }))
        .sort((a, b) => b.growth.growthScore - a.growth.growthScore)
        .slice(0, 5);

    const lines = reposWithGrowth.map(repo => {
        const growth = repo.growth;
        return `${repo.name}: ${growth.growthScore.toFixed(2)}/day`;
    });

    return createCard({
        title: "Repository Growth",
        lines,
        themeName: theme,
    });
}

module.exports = {
    renderRepoGrowthCard,
    renderRepoGrowthContent
};
