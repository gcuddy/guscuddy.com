require("dotenv").config();
const Cache = require("@11ty/eleventy-cache-assets");
const API_KEY = process.env.ARENA_KEY;
const USER_ID = 188745;
const API = "http://api.are.na/v2/";

module.exports = async function () {
  try {
    const channels = await Cache(`${API}users/${USER_ID}/channels`, {
      duration: "6h",
      type: "json",
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    });
    let filteredChannels = channels.channels.filter(
      (channel) => channel.status !== "private"
    );
    return filteredChannels;
  } catch (ex) {
    console.log(ex);
    return [];
  }
};
