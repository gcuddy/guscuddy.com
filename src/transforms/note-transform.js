const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const slugify = require('slugify');


// Obsidian comment matching regex
const commentRegex = /%%.*%%/g;

module.exports = async function (value, outputPath) {
  if (outputPath.includes("/notes/") && outputPath.endsWith(".html")) {


    value = value.replace(commentRegex, "");
    
    const DOM = new JSDOM(value, {
        resources: "usable",
      });
    const document = DOM.window.document;
    
    
    const articleLinks = [...document.querySelectorAll("main article a")];
    
    if (articleLinks.length) {
      for (let link of articleLinks) {
        let src = link.getAttribute('href');
        if (src.startsWith('/notes/')) {
          // Then slugify it
          let fileName = src.match(/\/notes\/(.+)\//)[1];
          fileName = slugify(fileName, {
            lower: true,
            replacement: "-",
            strict: true,
            remove: /[%20]/g
          })
          src = `/notes/${fileName}/`;
          link.setAttribute('href', src);
        }
      }
    }
    
    
    return "<!DOCTYPE html>\r\n" + document.documentElement.outerHTML;
  }
  return value;
};
