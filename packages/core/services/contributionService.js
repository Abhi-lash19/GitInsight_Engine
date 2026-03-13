const { graphqlRequest } = require("../clients/graphqlClient");

async function fetchTotalContributions(username) {
  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const data = await graphqlRequest(query, { username });

    // Defensive programming: handle missing data gracefully
    if (!data?.user) {
      console.warn(`⚠️ No user data found for username: ${username}`);
      return {
        totalContributions: 0,
        contributions: []
      };
    }

    const calendar = data.user.contributionsCollection?.contributionCalendar;
    const totalContributions = calendar?.totalContributions || 0;

    // Flatten contribution calendar weeks into array of { date, count }
    const contributions = [];
    if (calendar?.weeks) {
      for (const week of calendar.weeks) {
        if (week?.contributionDays) {
          for (const day of week.contributionDays) {
            if (day?.date && day?.contributionCount !== undefined) {
              contributions.push({
                date: day.date,
                count: day.contributionCount
              });
            }
          }
        }
      }
    }

    console.log(`📊 Fetched contributions count: ${totalContributions}`);
    console.log(`📅 Fetched contribution days: ${contributions.length}`);

    return {
      totalContributions,
      contributions
    };
  } catch (error) {
    console.error(`❌ Error fetching contributions for ${username}:`, error.message);
    // Return fallback data to prevent pipeline crash
    return {
      totalContributions: 0,
      contributions: []
    };
  }
}

module.exports = { fetchTotalContributions };
