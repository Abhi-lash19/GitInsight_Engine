function calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

module.exports = { calculateTotalStars };
