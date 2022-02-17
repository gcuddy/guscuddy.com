const isProduction = process.env.NODE_ENV === 'production'
const fs = require('fs')

// Filters
const dateFilter = require('./src/filters/date-filter.js')
const w3DateFilter = require('./src/filters/w3-date-filter.js')
const dateMonthFilter = require('./src/filters/date-month-filter.js')
const issueExtract = require('./src/filters/issue-extract')
const cssmin = require('./src/filters/cssmin')
const jsmin = require('./src/filters/jsmin')
const isbn = require('./src/filters/isbn')
const dumpFilter = require('./src/filters/dump')
const excerptFilter = require('./src/filters/excerpt')
const timestampFilter = require('./src/filters/timestamp')
const strictSlugFilter = require('./src/filters/strict-slug')
const fileNameFilter = require('./src/filters/file-name')
const slugFilter = require('./src/filters/slug')
const padFilter = require('./src/filters/pad3')

// Plugins
const rssPlugin = require('@11ty/eleventy-plugin-rss')
// const embedTwitter = require('eleventy-plugin-embed-twitter')
const pluginPageAssets = require('eleventy-plugin-page-assets')

// Utils
const markdown = require('./src/utils/markdown.js')

// Transforms
const htmlMinTransform = require('./src/transforms/html-min-transform')
const parseTransform = require('./src/transforms/parse-transforms')
const embedTransform = require('./src/transforms/embeds')
const twitterTransform = require('./src/transforms/twitter-transform')
const instagramTransform = require('./src/transforms/instagram-transform.js')
const path = require('path')
// const obsdianEmbed = require('./src/transforms/obsidian-embed')
//const noteTransform = require("./src/transforms/note-transform");

module.exports = config => {
    const CONTENT_GLOBS = {
        posts: ['src/posts/*/*.md', 'src/newsletter/**/*.md'],
        notes: 'src/notes/*.md',
        media: '*.jpg|*.jpeg|*.png|*.gif|*.mp4|*.webp|*.webm',
    }

    // Quiet Mode - comment out for noisiness
    config.setQuietMode(true)

    // Add filters
    config.addFilter('dateFilter', dateFilter)
    config.addFilter('w3DateFilter', w3DateFilter)
    config.addFilter('dateMonthFilter', dateMonthFilter)
    config.addFilter('issueExtract', issueExtract)
    config.addFilter('timestampFilter', timestampFilter)
    config.addFilter('cssmin', cssmin)
    config.addFilter('dumpFilter', dumpFilter)
    config.addFilter('excerpt', excerptFilter)
    config.addFilter('strictSlug', strictSlugFilter)
    config.addFilter('fileNameFilter', fileNameFilter)
    config.addFilter('slug', slugFilter)
    config.addFilter('pad3', padFilter)
    config.addNunjucksAsyncFilter('jsmin', jsmin)
    config.addNunjucksAsyncFilter('isbn', isbn)

    // Plugins
    config.addPlugin(rssPlugin)
    // config.addPlugin(embedTwitter, {
    //     doNotTrack: true,
    //     embedClass: 'twitter-embed',
    //     theme: 'dark',
    //     twitterScript: {
    //         defer: true,
    //     },
    // })
    config.addPlugin(pluginPageAssets, {
        mode: 'directory',
        postsMatching: 'src/newsletter/**/*.md',
        assetsMatching: CONTENT_GLOBS.media,
        silent: true,
    })

    // Transforms
    config.addTransform('embedtransform', embedTransform)
    config.addTransform('twitterTransform', twitterTransform)
    config.addTransform('instagramTransform', instagramTransform)
    // config.addTransform('obsidianEmbed', obsdianEmbed)
    //config.addTransform("noteTransform", noteTransform);
    if (isProduction) {
        config.addTransform('parsetransform', parseTransform)
        config.addTransform('htmlmin', htmlMinTransform)
    }

    // Markdown parsing
    config.setLibrary('md', markdown)
    config.addFilter('markdownify', string => {
        return markdown.render(string)
    })
    config.setDataDeepMerge(true)

    config.addPassthroughCopy('./src/fonts')
    config.addPassthroughCopy('./src/files')
    config.addPassthroughCopy('_headers')

    config.addCollection('newsletter', collection => {
        return [
            ...collection.getFilteredByGlob(
                './src/newsletter/**/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*.md'
            ),
        ].reverse()
    })

    config.addCollection('blog', collection => {
        return [...collection.getFilteredByGlob('./src/posts/*.md')]
            .reverse()
            .filter(item => item.data.permalink !== false)
            .filter(item => !(item.data.draft && isProduction))
    })

    // this combines blog + newsletter collections
    config.addCollection('archives', collection => {
        return [
            ...collection.getFilteredByGlob([
                './src/posts/*.md',
                './src/newsletter/**/*.md',
            ]),
        ].reverse()
    })

    config.addCollection('shows', collection => {
        return [
            ...collection.getFilteredByGlob('./src/shows/**/*.md'),
        ].reverse()
    })

    config.addCollection('bookLog', collection => {
        return [
            ...collection.getFilteredByGlob('./src/logs/books/*.md'),
        ].reverse()
    })

    config.addCollection('notes', function (collection) {
        return [...collection.getFilteredByGlob('./src/notes/**/*.md')].sort(
            (a, b) => {
                //sort by filename
                if (a.fileSlug < b.fileSlug) {
                    return -1
                }
                return 1
            }
        )
    })
    config.addShortcode('showPhotos', (directory, page) => {
        const html = fs
            .readdirSync(path.join(__dirname, './src/', directory))
            .map((file, index) => {
                return `
                <a href="${
                    page.url + String(index + 1)
                }"><img src="${directory}/${file}" alt="Photo of Gus Cuddy in " /></a>`
            })
        console.log(page)
        return html.join('\n')
    })
    config.addFilter('firstPhoto', directory => {
        return path.join(
            directory,
            fs.readdirSync(path.join(__dirname, './src/', directory))[0]
        )
    })

    // config.addCollection("showsByYear", (collection) => {
    //   return _.chain(collection.getFilteredByGlob("./src/shows/**/*.md"))
    //     .groupBy((show) => show.date.getFullYear())
    //     .toPairs()
    //     .reverse()
    //     .value();
    // });

    config.setUseGitIgnore(false)

    return {
        markdownTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dir: {
            input: 'src',
            output: 'dist',
        },
    }
}
