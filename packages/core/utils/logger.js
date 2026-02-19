function logInfo(message) {
    console.log(`ℹ️ ${message}`);
}

function logWarn(message) {
    console.warn(`⚠️ ${message}`);
}

function logError(message) {
    console.error(`❌ ${message}`);
}

module.exports = {
    logInfo,
    logWarn,
    logError,
};
