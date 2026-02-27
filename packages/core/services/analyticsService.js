function calculateTopRepo(repos) {
    if (!repos.length) return null;

    const top = repos.reduce((max, repo) =>
        repo.stargazers_count > max.stargazers_count ? repo : max
    );

    return {
        name: top.name,
        stars: top.stargazers_count,
    };
}

function calculateAverageStars(repos) {
    if (!repos.length) return 0;

    const totalStars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
    );

    return (totalStars / repos.length).toFixed(2);
}

function calculateRepoImpact(repo) {
    return (
        repo.stargazers_count * 2 +
        repo.forks_count * 1.5 +
        (repo.size || 0) * 0.01
    );
}

module.exports = {
    calculateTopRepo,
    calculateAverageStars,
    calculateRepoImpact,
};