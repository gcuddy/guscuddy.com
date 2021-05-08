const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const slugify = require('slugify')
const slugifyOptions = {
    replacement: '-',
    remove: /[&,+()$~%.'":*?<>{}]/g,
    lower: true,
}
// could just import the filter instead of this

const markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
})
    .use(markdownItAnchor, {
        permalink: true,
        permalinkSymbol: '#',
        permalinkClass: 'heading-anchor',
        permalinkBefore: true,
        level: 2,
    })
    .use(require('markdown-it-footnote'))
    .use(function (md) {
        //Add obsidian embed
        md.linkify.add('![[', {
            validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
            normalize: match => {
                const parts = match.raw.slice(3, -2).split('|')
                parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, '')
                match.text = (parts[1] || parts[0]).trim()
                match.url = `/notes/${slugify(parts[0], slugifyOptions)}/`
            },
        })

        // Recognize Mediawiki links ([[text]])
        md.linkify.add('[[', {
            validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
            normalize: match => {
                const parts = match.raw.slice(2, -2).split('|')
                parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, '')
                match.text = (parts[1] || parts[0]).trim()
                match.url = `/notes/${slugify(parts[0], slugifyOptions)}/`
            },
        })
    })
    .use(require('markdown-it-mark'))

markdown.renderer.rules.footnote_block_open = () =>
    `<section class="footnotes">
    <h2 class="footnotes__heading">Footnotes</h2>
    <ol>`

module.exports = markdown
