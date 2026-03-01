const { requestWithRetry } = require("../clients/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../clients/rateLimiter");
const pLimit = require("p-limit");
const {
    isRepoCacheValid,
    readRepoCache,
    writeRepoCache,
} = require('../cache/cacheManager');

const MAX_PAGES = 10;
const COMMIT_DETAIL_CONCURRENCY = 3;
const detailLimit = pLimit(COMMIT_DETAIL_CONCURRENCY);

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const ONE_YEAR_DAYS = 365;

function formatDateKey(date) {
    return date.toISOString().slice(0, 10);
}

function buildDailyMatrix(map) {
    const days = 365;
    const result = new Array(days).fill(0);

    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = formatDateKey(d);
        result[i] = map[key] || 0;
    }

    return result;
}

async function fetchAllCommits(repoName) {
    if (isRepoCacheValid(githubConfig.username, repoName, "commits_full")) {
        return readRepoCache(githubConfig.username, repoName, "commits_full");
    }

    let page = 1;
    let allCommits = [];

    while (page <= MAX_PAGES) {
        const commits = await requestWithRetry(
            {
                method: "GET",
                url: `/repos/${githubConfig.username}/${repoName}/commits`,
                params: {
                    per_page: 100,
                    page,
                },
            },
            5
        );

        if (!Array.isArray(commits) || commits.length === 0) break;

        allCommits = allCommits.concat(commits);

        if (commits.length < 100) break;

        page++;
    }

    writeRepoCache(githubConfig.username, repoName, "commits_full", allCommits);
    return allCommits;
}

function getWeekIndex(date) {
    const now = new Date();
    const diffInWeeks = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7));
    return diffInWeeks >= 0 && diffInWeeks < 52 ? 51 - diffInWeeks : null;
}

async function calculateAdvancedCommitStats(
    repos,
    languageStats,
    previousAdvancedStats = null
) {
    const commitsPerRepo = previousAdvancedStats?.commitsPerRepo || {};
    const weeklyCommitTrend = previousAdvancedStats?.weeklyCommitTrend
        ? [...previousAdvancedStats.weeklyCommitTrend]
        : new Array(52).fill(0);

    const dailyCommitMap = previousAdvancedStats?.dailyCommitMap
        ? { ...previousAdvancedStats.dailyCommitMap }
        : {};

    let totalCommits = previousAdvancedStats?.totalCommits || 0;
    let totalLinesAdded = previousAdvancedStats?.codeStats?.totalLinesAdded || 0;
    let totalLinesDeleted = previousAdvancedStats?.codeStats?.totalLinesDeleted || 0;

    const repoMeta = previousAdvancedStats?.repoMeta || {};

    const now = new Date();

    const tasks = repos.map(repo =>
        limit(async () => {

            let page = 1;
            let newCommits = [];
            let stop = false;

            const previousSha = repoMeta?.[repo.name]?.latestProcessedSha;

            while (!stop && page <= MAX_PAGES) {
                const commits = await requestWithRetry({
                    method: "GET",
                    url: `/repos/${githubConfig.username}/${repo.name}/commits`,
                    params: { per_page: 100, page },
                });

                if (!Array.isArray(commits) || commits.length === 0) break;

                for (const commit of commits) {
                    if (previousSha && commit.sha === previousSha) {
                        stop = true;
                        break;
                    }
                    newCommits.push(commit);
                }

                if (commits.length < 100) break;
                page++;
            }

            /**
             * No new commits → skip
             */
            if (previousAdvancedStats && newCommits.length === 0) {
                return;
            }

            if (!repoMeta[repo.name]) repoMeta[repo.name] = {};

            if (!previousAdvancedStats) {
                commitsPerRepo[repo.name] = 0;
            }

            commitsPerRepo[repo.name] =
                (commitsPerRepo[repo.name] || 0) + newCommits.length;

            totalCommits += newCommits.length;

            let commitDetailCache = {};
            if (isRepoCacheValid(githubConfig.username, repo.name, "commit_details")) {
                commitDetailCache =
                    readRepoCache(
                        githubConfig.username,
                        repo.name,
                        "commit_details"
                    ) || {};
            }

            for (const commit of newCommits) {

                const commitDate = new Date(commit.commit.author.date);

                const weekIndex = getWeekIndex(commitDate);
                if (weekIndex !== null) weeklyCommitTrend[weekIndex]++;

                const diffDays = Math.floor(
                    (now - commitDate) / (1000 * 60 * 60 * 24)
                );

                if (diffDays >= 0 && diffDays <= ONE_YEAR_DAYS) {
                    const key = formatDateKey(commitDate);
                    dailyCommitMap[key] =
                        (dailyCommitMap[key] || 0) + 1;
                }

                let details = commitDetailCache[commit.sha];

                if (!details) {
                    details = await requestWithRetry({
                        method: "GET",
                        url: `/repos/${githubConfig.username}/${repo.name}/commits/${commit.sha}`,
                    });
                    commitDetailCache[commit.sha] = details;
                }

                if (details?.stats) {
                    totalLinesAdded += details.stats.additions || 0;
                    totalLinesDeleted += details.stats.deletions || 0;
                }
            }

            if (newCommits.length > 0) {
                repoMeta[repo.name].latestProcessedSha = newCommits[0].sha;
            }

            writeRepoCache(
                githubConfig.username,
                repo.name,
                "commit_details",
                commitDetailCache
            );
        })
    );

    await Promise.all(tasks);

    const dailyCommitMatrix = buildDailyMatrix(dailyCommitMap);

    return {
        totalCommits,
        commitsPerRepo,
        weeklyCommitTrend,
        dailyCommitMap,
        dailyCommitMatrix,
        codeStats: {
            totalLinesAdded,
            totalLinesDeleted,
            netLines: totalLinesAdded - totalLinesDeleted,
        },
        repoMeta,
    };
}

module.exports = { calculateAdvancedCommitStats };