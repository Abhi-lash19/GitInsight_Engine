function calculateTotalForks(repos) {
    return repos.reduce((total, repo) => total + repo.forks_count, 0);
}

module.exports = { calculateTotalForks };

