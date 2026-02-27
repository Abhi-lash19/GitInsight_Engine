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

async function fetchCommitDetails(repoName, sha) {
    return requestWithRetry(
        {
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/commits/${sha}`,
        },
        5
    );
}

function getWeekIndex(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));

    if (diffInWeeks >= 0 && diffInWeeks < 52) {
        return 51 - diffInWeeks;
    }

    return null;
}

function getDateKey(date) {
    return date.toISOString().split("T")[0];
}

async function calculateAdvancedCommitStats(repos, languageStats) {
    const commitsPerRepo = {};
    const weeklyCommitTrend = new Array(52).fill(0);

    const dailyCommitMap = {};
    const dailyCommitMatrix = [];

    let totalCommits = 0;
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    const detailMemo = new Map();
    const now = new Date();

    const tasks = repos.map((repo) =>
        limit(async () => {
            const commits = await fetchAllCommits(repo.name);

            if (!Array.isArray(commits)) {
                commitsPerRepo[repo.name] = 0;
                return;
            }

            commitsPerRepo[repo.name] = commits.length;
            totalCommits += commits.length;

            const recentCommits = commits.filter(commit => {
                if (!commit || !commit.commit?.author?.date) return false;
                const d = new Date(commit.commit.author.date);
                return Date.now() - d.getTime() < ONE_YEAR_MS;
            });

            await Promise.all(
                recentCommits.map(commit =>
                    detailLimit(async () => {
                        if (!commit || !commit.sha) return;

                        const commitDate = new Date(commit.commit.author.date);

                        /**
                         * Weekly trend (existing logic)
                         */
                        const weekIndex = getWeekIndex(commitDate);
                        if (weekIndex !== null) {
                            weeklyCommitTrend[weekIndex]++;
                        }

                        /**
                         * Daily map (NEW)
                         */
                        const diffDays = Math.floor((now - commitDate) / (1000 * 60 * 60 * 24));
                        if (diffDays >= 0 && diffDays <= ONE_YEAR_DAYS) {
                            const key = getDateKey(commitDate);
                            dailyCommitMap[key] = (dailyCommitMap[key] || 0) + 1;
                        }

                        /**
                         * Commit detail stats (existing logic)
                         */
                        if (!detailMemo.has(commit.sha)) {
                            const details = await fetchCommitDetails(repo.name, commit.sha);
                            detailMemo.set(commit.sha, details);
                        }

                        const details = detailMemo.get(commit.sha);

                        if (details && details.stats) {
                            totalLinesAdded += details.stats.additions || 0;
                            totalLinesDeleted += details.stats.deletions || 0;
                        }
                    })
                )
            );
        })
    );

    await Promise.all(tasks);

    /**
     * Build ordered 365-day array
     */
    const orderedDays = [];
    for (let i = ONE_YEAR_DAYS - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = getDateKey(d);
        orderedDays.push(dailyCommitMap[key] || 0);
    }

    /**
     * Convert to GitHub-style 7×52 matrix
     */
    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const index = col * 7 + row;
            dailyCommitMatrix.push(orderedDays[index] || 0);
        }
    }

    const commitsByLanguage = {};
    Object.entries(languageStats || {}).forEach(([lang, percent]) => {
        const numericPercent = parseFloat(percent);
        if (!isNaN(numericPercent)) {
            commitsByLanguage[lang] = Math.round(
                (numericPercent / 100) * totalCommits
            );
        }
    });

    return {
        totalCommits,
        commitsPerRepo,
        weeklyCommitTrend,
        dailyCommitMap,
        dailyCommitMatrix,
        commitsByLanguage,
        codeStats: {
            totalLinesAdded,
            totalLinesDeleted,
            netLines: totalLinesAdded - totalLinesDeleted,
        },
    };
}

module.exports = { calculateAdvancedCommitStats };