const { requestWithRetry } = require("../core/apiClient");
const githubConfig = require("../config/githubConfig");

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
