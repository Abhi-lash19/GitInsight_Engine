const dark = require("./dark");
const light = require("./light");
const dracula = require("./dracula");
const nord = require("./nord");
const forest = require("./forest");
const solarized = require("./solarized");

function getTheme(name = "dark") {
    const themes = {
        dark,
        light,
        dracula,
        nord,
        forest,
        solarized,
    };

    return themes[name] || dark;
}

module.exports = { getTheme };
