const { graphqlRequest } = require("../core/graphqlClient");

async function fetchTotalContributions(username) {
    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

    const data = await graphqlRequest(query, { username });

    return (
        data.user?.contributionsCollection?.contributionCalendar
            ?.totalContributions || 0
    );
}

module.exports = { fetchTotalContributions };
