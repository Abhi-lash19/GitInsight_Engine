const pLimit = require("p-limit");

const limit = pLimit(5); // max 5 concurrent API calls

module.exports = limit;
