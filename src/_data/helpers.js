const cheerio = require("cheerio");
let markdownIt = require("markdown-it");
const fs = require("fs");
const Cache = require("@11ty/eleventy-cache-assets");

module.exports = {
  /**
   * Returns back some attributes based on whether the
   * link is active or a parent of an active item
   *
   * @param {String} itemUrl The link in question
   * @param {String} pageUrl The page context
   * @returns {String} The attributes or empty
   */
  getLinkActiveState(itemUrl, pageUrl) {
    let response = "";

    if (itemUrl === pageUrl) {
      response = ' aria-current="page"';
    }

    if (itemUrl.length > 1 && pageUrl.indexOf(itemUrl) === 0) {
      response += ' data-state="active"';
    }

    return response;
  },
  /**
   * Filters out the passed item from the passed collection
   * and randomises and limits them based on flags
   *
   * @param {Array} collection The 11ty collection we want to take from
   * @param {Object} item The item we want to exclude (often current page)
   * @param {Number} limit=3 How many items we want back
   * @param {Boolean} random=true Wether or not this should be randomised
   * @returns {Array} The resulting collection
   */
  getSiblingContent(collection, item, limit = 3, random = true) {
    let filteredItems = collection.filter((x) => x.url !== item.url);

    if (random) {
      let counter = filteredItems.length;

      while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        counter--;

        let temp = filteredItems[counter];

        // Swap the last element with the random one
        filteredItems[counter] = filteredItems[index];
        filteredItems[index] = temp;
      }
    }

    // Lastly, trim to length
    if (limit > 0) {
      filteredItems = filteredItems.slice(0, limit);
    }

    return filteredItems;
  },

  /**
   * Gets the first h1 from a file
   * and returns it as a title.
   *
   * @param {String} page The page object to get the title from
   * @returns {String} The text of the first h1
   */

  getTitle(page) {
    const { inputPath } = page;
    const file = fs.readFileSync(inputPath);
    const contents = file.toString();
    let md = new markdownIt();

    let $ = cheerio.load(md.render(contents));

    let title = $("h1").text();

    return title;
  },
};
