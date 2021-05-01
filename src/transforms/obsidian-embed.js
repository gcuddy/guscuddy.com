const fg = require("fast-glob");

module.exports = async function (value, outputPath) {
  if (outputPath.includes("/notes/") && outputPath.endsWith(".html")) {
    let regex = /!(\[\[|<a href=".+">)(.+)(\]\]|\<\/a\>)/gm;

    let matches = [...value.matchAll(regex)];
    if (matches.length > 0) {
      for (let match of matches) {
        let fileName = match[2];
        const file = await fg(`./dist/notes/**/${fileName}`);
        let path = file.replace("./dist", "");
        // need to figure out how to change link
      }
    }
  }
};


// Could I do this in Tranforms?