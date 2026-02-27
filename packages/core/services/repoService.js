const { graphqlRequest } = require("../clients/graphqlClient");
const githubConfig = require("../config/githubConfig");

/**
 * Fetch repositories using GraphQL batching
 * Faster + fewer API calls
 */
async function fetchAllRepos() {
    const query = `
        query ($login: String!) {
            user(login: $login) {
                repositories(first: 100, ownerAffiliations: OWNER) {
                    nodes {
                        name
                        stargazerCount
                        forkCount
                        diskUsage
                    }
                }
            }
        }
    `;

    const data = await graphqlRequest(query, {
        login: githubConfig.username,
    });

    const repos =
        data?.user?.repositories?.nodes?.map((r) => ({
            name: r.name,
            stargazers_count: r.stargazerCount,
            forks_count: r.forkCount,
            size: r.diskUsage,
        })) || [];

    console.log(`⚡ GraphQL repos fetched: ${repos.length}`);

    return repos;
}

module.exports = { fetchAllRepos };