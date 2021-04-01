// Filters
const dateFilter = require("./src/filters/date-filter.js");
const w3DateFilter = require("./src/filters/w3-date-filter.js");
const issueExtract = require("./src/filters/issue-extract");
const cssmin = require("./src/filters/cssmin");
const jsmin = require("./src/filters/jsmin");
const isbn = require("./src/filters/isbn");

// Plugins
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const embed = require("eleventy-plugin-embed-everything");
const pluginPageAssets = require('eleventy-plugin-page-assets')

// Utils
const markdown = require ('./src/utils/markdown.js');

// Transforms
const parseTransform = require('./src/transforms/parse-transforms');

module.exports = (config) => {

  const CONTENT_GLOBS = {
    posts: ['src/posts/*/*.md', 'src/newsletter/**/*.md'],
    notes: 'src/notes/*.md',
    media: '*.jpg|*.png|*.gif|*.mp4|*.webp|*.webm'
}


  // Add filters
  config.addFilter("dateFilter", dateFilter);
  config.addFilter("w3DateFilter", w3DateFilter);
  config.addFilter("issueExtract", issueExtract);
  config.addFilter("cssmin", cssmin);
  config.addNunjucksAsyncFilter("jsmin", jsmin);
  config.addNunjucksAsyncFilter("isbn", isbn);

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(embed);
  config.addPlugin(pluginPageAssets, {
    postsMatching: "src/newsletter/*/*.md",
    silent: true,
  });

// Transforms
  config.addTransform("parsetransform", parseTransform);

  // Markdown parsing
  config.setLibrary('md', markdown);
  config.addFilter("markdownify", string => {
    return markdown.render(string)
})
  config.setDataDeepMerge(true)

  config.addPassthroughCopy("./src/fonts");

  config.addCollection("newsletter", (collection) => {
    return [...collection.getFilteredByGlob("./src/newsletter/**/*.md")].reverse();
  });

  config.addCollection("blog", (collection) => {
    return [...collection.getFilteredByGlob("./src/posts/*.md")].reverse();
  });

  config.addCollection("shows", (collection) => {
    return [...collection.getFilteredByGlob("./src/shows/**/*.md")].reverse();
  })

  config.addCollection("bookLog", (collection) => {
    return [...collection.getFilteredByGlob("./src/logs/books/*.md")].reverse();
  });

  config.addCollection("notes", function (collection) {
    return collection.getFilteredByGlob(["./src/notes/**/*.md"]);
  });

  config.setUseGitIgnore(false);

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
