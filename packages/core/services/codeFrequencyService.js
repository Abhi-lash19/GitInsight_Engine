const { requestWithRetry } = require("../clients/apiClient");
const githubConfig = require("../config/githubConfig");
const limit = require("../clients/rateLimiter");
const pLimit = require("p-limit");

const commitDetailLimit = pLimit(3);
const COMMIT_DETAIL_CONCURRENCY = 3;

async function fetchRepoCodeFrequency(repoName) {

    try {

        const data = await requestWithRetry({
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/stats/code_frequency`,
        });

        // GitHub returns [] when stats not ready
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        return data;

    } catch {
        return null;
    }
}


async function fetchCommitStats(repoName) {

    try {

        const commits = await requestWithRetry({
            method: "GET",
            url: `/repos/${githubConfig.username}/${repoName}/commits`,
            params: { per_page: 30 },
        });

        if (!Array.isArray(commits) || commits.length === 0) {
            return null;
        }

        let additions = 0;
        let deletions = 0;

        const tasks = commits.map(commit =>
            commitDetailLimit(async () => {

                const sha = commit.sha;

                const details = await requestWithRetry({
                    method: "GET",
                    url: `/repos/${githubConfig.username}/${repoName}/commits/${sha}`,
                });

                const stats = details?.stats;

                if (!stats) return;

                additions += stats.additions || 0;
                deletions += stats.deletions || 0;

            })
        );

        await Promise.all(tasks);

        return { additions, deletions };

    } catch {
        return null;
    }
}

async function calculateCodeFrequencyStats(repos) {

    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    console.log("\n📊 Fetching code frequency stats...");

    const tasks = repos.map(repo =>
        limit(async () => {

            console.log("Processing repo:", repo.name);

            const weeks = await fetchRepoCodeFrequency(repo.name);

            /**
             * Primary source — GitHub weekly stats
             */
            if (weeks) {

                for (const week of weeks) {

                    const additions = week[1] || 0;
                    const deletions = Math.abs(week[2] || 0);

                    totalLinesAdded += additions;
                    totalLinesDeleted += deletions;
                }

                return;
            }

            /**
             * Fallback — calculate from commits
             */
            console.log(`⚠️ Code frequency unavailable for ${repo.name} — using commit stats`);

            const commitStats = await fetchCommitStats(repo.name);

            if (!commitStats) return;

            totalLinesAdded += commitStats.additions;
            totalLinesDeleted += commitStats.deletions;

        })
    );

    await Promise.all(tasks);

    return {
        totalLinesAdded,
        totalLinesDeleted,
        netLines: totalLinesAdded - totalLinesDeleted,
    };
}

module.exports = { calculateCodeFrequencyStats };