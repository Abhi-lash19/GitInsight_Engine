const fs = require("fs");
const path = require("path");

const { generateAllCards } = require("../generators/generateAllCards");

const CARDS_DIR = path.join(process.cwd(), "cards");

function getSvgPath(username, card) {
    return path.join(CARDS_DIR, `${username}-${card}.svg`);
}

function svgExists(username, card) {
    return fs.existsSync(getSvgPath(username, card));
}

function readSvg(username, card) {
    return fs.readFileSync(getSvgPath(username, card), "utf8");
}

async function ensureCardsGenerated(username, stats) {
    const cardPath = getSvgPath(username, card);

    if (!fs.existsSync(cardPath)) {
        generateAllCards(username, stats);
    }
}

async function getSvgCard(username, card, stats) {
    await ensureCardsGenerated(username, stats, card);

    return readSvg(username, card);
}

module.exports = {
    getSvgCard
};