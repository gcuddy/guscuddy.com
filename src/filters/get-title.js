const cheerio = require("cheerio");
let markdownIt = require("markdown-it");
const fs = require("fs");

module.exports = (page) => {
  const { inputPath } = page;
  const file = fs.readFileSync(inputPath);
  const contents = file.toString();
  let md = new markdownIt();

  let $ = cheerio.load(md.render(contents));

  // if (option === "content") {
  //   return $("");
  // }
  let title = $("h1").text();

  return title;
};
