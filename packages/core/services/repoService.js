const { graphqlRequest } = require("../clients/graphqlClient");
const githubConfig = require("../config/githubConfig");

/**
 * Fetch repositories using GraphQL batching
 * Faster + fewer API calls
 */
async function fetchAllRepos() {
    try {
        const query = `
            query ($login: String!) {
                user(login: $login) {
                    repositories(first: 100, ownerAffiliations: OWNER) {
                        nodes {
                            name
                            stargazerCount
                            forkCount
                            diskUsage
                            createdAt
                            defaultBranchRef {
                                target {
                                    ... on Commit {
                                        history(first: 50) {
                                            nodes {
                                                committedDate
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const data = await graphqlRequest(query, {
            login: githubConfig.username,
        });

        // Defensive programming: handle missing data gracefully
        if (!data?.user?.repositories?.nodes) {
            console.warn(`⚠️ No repository data found for user: ${githubConfig.username}`);
            return [];
        }

        const repos = data.user.repositories.nodes
            .filter(repo => repo != null) // Filter out null repositories
            .map((r) => ({
                name: r.name || 'unknown',
                stargazers_count: r.stargazerCount || 0,
                forks_count: r.forkCount || 0,
                size: r.diskUsage || 0,
                createdAt: r.createdAt || null,
                commits: r.defaultBranchRef?.target?.history?.nodes?.map(commit => ({
                    date: commit.committedDate
                })).filter(commit => commit.date) || [] // Filter out commits without dates
            })) || [];

        console.log(`⚡ GraphQL repos fetched: ${repos.length}`);

        // Log commits count
        const totalCommits = repos.reduce((sum, repo) => sum + repo.commits.length, 0);
        console.log(`📝 Fetched commits count: ${totalCommits}`);

        return repos;
    } catch (error) {
        console.error(`❌ Error fetching repositories for ${githubConfig.username}:`, error.message);
        // Return fallback data to prevent pipeline crash
        return [];
    }
}

module.exports = { fetchAllRepos };