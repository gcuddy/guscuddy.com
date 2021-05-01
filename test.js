const fg = require("fast-glob");
const path = require("path");

(async () => {
  let entries = await fg("./src/newsletter/**/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*.md");
  //   console.log(file);
  for (let entry of entries) {
    console.log(entry);
  }
})();
