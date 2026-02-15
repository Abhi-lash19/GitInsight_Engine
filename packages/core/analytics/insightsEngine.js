function calculateInsights({
    totalCommits = 0,
    weeklyCommitTrend = [],
    codeStats = {},
    repos = [],
}) {
    const weeksWithActivity = weeklyCommitTrend.filter((c) => c > 0).length;
    const avgCommitsPerWeek =
        weeklyCommitTrend.reduce((a, b) => a + b, 0) / 52 || 0;

    const mostActiveWeek = weeklyCommitTrend.indexOf(
        Math.max(...weeklyCommitTrend)
    );

    const churnRatio =
        codeStats.totalLinesAdded > 0
            ? codeStats.totalLinesDeleted / codeStats.totalLinesAdded
            : 0;

    const productivityScore = Math.min(
        100,
        Math.round(totalCommits * 0.8 + weeksWithActivity * 1.5)
    );

    let activityLevel = "Low";
    if (productivityScore > 70) activityLevel = "High";
    else if (productivityScore > 40) activityLevel = "Medium";

    const repoImpactScore = repos.reduce(
        (score, r) =>
            score +
            r.stargazers_count * 2 +
            r.forks_count * 1.5 +
            (r.size || 0) * 0.01,
        0
    );

    return {
        productivityScore,
        activityLevel,
        churnRatio: Number(churnRatio.toFixed(3)),
        averageCommitsPerWeek: Number(avgCommitsPerWeek.toFixed(2)),
        mostActiveWeek,
        repoImpactScore: Number(repoImpactScore.toFixed(2)),
    };
}

module.exports = { calculateInsights };
