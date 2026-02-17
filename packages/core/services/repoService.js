const { requestWithRetry } = require("../clients/apiClient");
const githubConfig = require("../config/githubConfig");
const { readCache } = require("../cache/cacheManager");

async function fetchAllRepos() {
    let page = 1;
    const perPage = 100;
    let allRepos = [];
    let hasMore = true;

    while (hasMore) {
        console.log(`📦 Fetching repos page ${page}...`);

        const repos = await requestWithRetry({
            method: "GET",
            url: `/users/${githubConfig.username}/repos`,
            params: {
                per_page: perPage,
                page: page,
            },
        });

        // If GitHub returns 304, use cached repos instead
        if (!repos || !Array.isArray(repos)) {
            console.log("⚡ Using cached repository data");
            const cached = readCache(githubConfig.username);
            return cached?.repos || [];
        }

        allRepos = allRepos.concat(repos);

        if (repos.length < perPage) {
            hasMore = false;
        } else {
            page++;
        }
    }

    console.log(`✅ Total repositories fetched: ${allRepos.length}`);
    return allRepos;
}

module.exports = { fetchAllRepos };
