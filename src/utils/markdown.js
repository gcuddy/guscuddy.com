const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

const markdown = markdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
})
  .use(markdownItAnchor, {
    permalink: true,
    permalinkSymbol: "#",
    permalinkClass: "heading-anchor",
    permalinkBefore: true,
    level: 2,
  })
  .use(require("markdown-it-footnote"))
  .use(function (md) {
    // Add obsidian embed
    md.linkify.add("![[", {
      validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
      normalize: (match) => {
        const parts = match.raw.slice(2, -2).split("|");
        parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, "");
        match.text = (parts[1] || parts[0]).trim();
        match.url = `/notes/${parts[0].trim()}/`;
      },
    });
    // Recognize Mediawiki links ([[text]])
    md.linkify.add("[[", {
      validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
      normalize: (match) => {
        const parts = match.raw.slice(2, -2).split("|");
        parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, "");
        match.text = (parts[1] || parts[0]).trim();
        match.url = `/notes/${parts[0].trim()}/`;
      },
    });
  })
  .use(require("markdown-it-mark"));

module.exports = markdown;
