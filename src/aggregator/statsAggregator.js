const { calculateTotalStars } = require("../services/starService");
const { calculateTotalForks } = require("../services/forkService");

function buildStats(username, repos, languageStats) {
    return {
        username,
        totalRepos: repos.length,
        totalStars: calculateTotalStars(repos),
        totalForks: calculateTotalForks(repos),
        languages: languageStats,
    };
}

module.exports = { buildStats };
