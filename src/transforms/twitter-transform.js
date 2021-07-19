const buildTweet = require('../utils/twitter')
const pattern =
    /<p>(?:\s*)(?:<a(?:.*)>)?(?:\s*)(?:https?:)?(?:\/\/)?(?:w{3}\.)?(?:twitter\.com)\/([a-zA-Z0-9_]{1,15})?(?:\/(?:status)\/)(\d+)?(?:\S*)(?:\s*)(?:<\/a>)?(?:\s*)<\/p>/g
module.exports = async function (content, outputPath) {
    if (outputPath.endsWith('.html')) {
        const matches = [...content.matchAll(pattern)]
        if (matches.length < 1) return content
        for (let match of matches) {
            const [og, username, id] = match
            const html = await buildTweet(id, username)
            content = content.replace(og, html)
        }
        return content
    }
    return content
}
