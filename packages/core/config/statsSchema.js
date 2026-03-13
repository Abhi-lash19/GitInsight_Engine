/**
 * Stats Schema Validation for GitInsight
 * Validates the structure of aggregated stats objects
 */

const requiredFields = {
    username: 'string',
    totalRepos: 'number',
    totalStars: 'number',
    totalForks: 'number',
    languages: 'object',
    totalContributions: 'number',
    topRepo: 'object',
    averageStarsPerRepo: 'number',
    traffic: 'object',
    codeStats: 'object',
    repoImpact: 'array',
    insights: 'object'
};

const optionalFields = {
    contributions: 'array',
    commits: 'array',
    repositories: 'array'
};

/**
 * Validate the structure of a stats object
 * @param {Object} stats - The stats object to validate
 * @returns {Object} - { isValid: boolean, errors: string[], warnings: string[] }
 */
function validateStats(stats) {
    const errors = [];
    const warnings = [];

    if (!stats || typeof stats !== 'object') {
        errors.push('Stats object is required and must be an object');
        return { isValid: false, errors, warnings };
    }

    // Validate required fields
    for (const [field, expectedType] of Object.entries(requiredFields)) {
        if (!(field in stats)) {
            errors.push(`Missing required field: ${field}`);
            continue;
        }

        const actualType = Array.isArray(stats[field]) ? 'array' : typeof stats[field];
        if (actualType !== expectedType) {
            errors.push(`Field '${field}' should be of type ${expectedType}, got ${actualType}`);
        }
    }

    // Validate optional fields
    for (const [field, expectedType] of Object.entries(optionalFields)) {
        if (field in stats) {
            const actualType = Array.isArray(stats[field]) ? 'array' : typeof stats[field];
            if (actualType !== expectedType) {
                warnings.push(`Optional field '${field}' should be of type ${expectedType}, got ${actualType}`);
            }
        }
    }

    // Validate nested structures
    if (stats.languages && typeof stats.languages === 'object') {
        if (!stats.languages.total || typeof stats.languages.total !== 'number') {
            warnings.push('languages.total should be a number');
        }
        if (!stats.languages.data || !Array.isArray(stats.languages.data)) {
            warnings.push('languages.data should be an array');
        }
    }

    if (stats.repoImpact && Array.isArray(stats.repoImpact)) {
        stats.repoImpact.forEach((item, index) => {
            if (!item.name || typeof item.name !== 'string') {
                warnings.push(`repoImpact[${index}].name should be a string`);
            }
            if (typeof item.impactScore !== 'number') {
                warnings.push(`repoImpact[${index}].impactScore should be a number`);
            }
        });
    }

    // Validate new fields structure
    if (stats.contributions && Array.isArray(stats.contributions)) {
        stats.contributions.forEach((item, index) => {
            if (!item.date || typeof item.date !== 'string') {
                warnings.push(`contributions[${index}].date should be a string`);
            }
            if (typeof item.count !== 'number') {
                warnings.push(`contributions[${index}].count should be a number`);
            }
        });
    }

    if (stats.commits && Array.isArray(stats.commits)) {
        stats.commits.forEach((item, index) => {
            if (!item.repo || typeof item.repo !== 'string') {
                warnings.push(`commits[${index}].repo should be a string`);
            }
            if (!item.date || typeof item.date !== 'string') {
                warnings.push(`commits[${index}].date should be a string`);
            }
        });
    }

    if (stats.repositories && Array.isArray(stats.repositories)) {
        stats.repositories.forEach((item, index) => {
            if (!item.name || typeof item.name !== 'string') {
                warnings.push(`repositories[${index}].name should be a string`);
            }
            if (typeof item.stars !== 'number') {
                warnings.push(`repositories[${index}].stars should be a number`);
            }
            if (typeof item.forks !== 'number') {
                warnings.push(`repositories[${index}].forks should be a number`);
            }
        });
    }

    // Log warnings instead of throwing errors for non-critical issues
    if (warnings.length > 0) {
        console.warn('⚠️ Stats validation warnings:');
        warnings.forEach(warning => console.warn(`   - ${warning}`));
    }

    const isValid = errors.length === 0;
    
    if (!isValid) {
        console.error('❌ Stats validation errors:');
        errors.forEach(error => console.error(`   - ${error}`));
    }

    return { isValid, errors, warnings };
}

/**
 * Validate stats and throw error if critical issues found
 * @param {Object} stats - The stats object to validate
 */
function validateAndThrow(stats) {
    const { isValid, errors } = validateStats(stats);
    
    if (!isValid) {
        throw new Error(`Stats validation failed: ${errors.join(', ')}`);
    }
}

module.exports = {
    validateStats,
    validateAndThrow,
    requiredFields,
    optionalFields
};
