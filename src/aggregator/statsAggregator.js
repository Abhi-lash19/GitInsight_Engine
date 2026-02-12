const { calculateTotalStars } = require("../services/starService");
const { calculateTotalForks } = require("../services/forkService");

function buildBasicStats(username, repos) {
    return {
        username,
        totalRepos: repos.length,
        totalStars: calculateTotalStars(repos),
        totalForks: calculateTotalForks(repos),
    };
}

module.exports = { buildBasicStats };
