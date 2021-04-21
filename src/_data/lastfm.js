const Cache = require("@11ty/eleventy-cache-assets");
require("dotenv").config();

const API_KEY = process.env.LASTFM_KEY;
const USERNAME = "guscuddy";
const API = "http://ws.audioscrobbler.com/2.0/";

// Calls right now for top albums of last month.

module.exports = async () => {
  try {
    const recentAlbums = await Cache(
      `${API}?method=user.gettopalbums&user=${USERNAME}&api_key=${API_KEY}&format=json&period=1month`,
      {
        duration: "2h",
        type: "json",
      }
    );
    // for (let album of recentAlbums.weeklyalbumchart.album) {
    //   let artist = encodeURIComponent(album.artist["#text"]);
    //   let albumName = encodeURIComponent(album.name);
    //   const albumInfo = await Cache(
    //     `${API}?method=album.getinfo&api_key=${API_KEY}&artist=${artist}&album=${albumName}&format=json`,
    //     {
    //       duration: "24h",
    //       type: "json",
    //     }
    //   );
    //   album.image = albumInfo.album.image[2]["#text"];
    // }
    return recentAlbums.topalbums.album;
  } catch (ex) {
    console.log(ex);

    return [];
  }
};
