require("dotenv").config();
const axios = require("axios");

console.log("\n📌 PROCESS.ENV CONTENTS:");
console.log({
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
});

async function testConnection() {
    try {
        const url = `https://api.github.com/users/${process.env.GITHUB_USERNAME}`;
        console.log("\n📡 Requesting URL:", url);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        console.log("\n✅ API Connected Successfully!");
        console.log("Username from API:", response.data.login);
    } catch (error) {
        console.error("\n❌ API Error:");
        console.error(error.response?.data || error.message);
    }
}

testConnection();
