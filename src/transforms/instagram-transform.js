const Cache = require('@11ty/eleventy-cache-assets')
const Image = require('@11ty/eleventy-img')
const pattern =
    /<p>(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:\/\/)?(?:w{3}\.)?(?:instagram\.com)\/(?:p\/)?([0-9a-zA-Z-_]{11})(?:\S*)(?=(\s*))\4(?:<\/a>)?(?=(\s*))\5<\/p>/g
module.exports = async function (content, outputPath) {
    if (outputPath.endsWith('.html')) {
        const matches = [...content.matchAll(pattern)]
        if (matches.length < 1) return content
        for (let match of matches) {
            const id = match[3]
            const data = await getInstagramData(id)
            if (!data) continue
            const parsed = parseInstagramData(data)
            const html = await getImageHTML(
                parsed.image,
                {
                    alt: parsed.alt,
                    class: 'instagram-image',
                },
                {
                    widths: [600, 1200],
                }
            )
            content = content.replace(
                match[0],
                `<article class="instagram-embed">
                    <a class="instagram-embed__user" href="https://instagram.com/${parsed.owner.username}/">${parsed.owner.username}</a>
                    <a class="instagram-embed__image" href="${parsed.url}">
                        ${html}
                    </a>
                    <p class="instagram-embed__caption">${parsed.caption}</p>
                </article>`
            )
        }
        return content
    }
    return content
}

async function getInstagramData(id) {
    const url = `https://www.instagram.com/p/${id}/?__a=1`
    try {
        return await Cache(url, {
            duration: '1y',
            type: 'json',
        })
    } catch (e) {
        console.error(e)
    }
}

function parseInstagramData(data) {
    const {
        graphql: {
            shortcode_media: {
                owner,
                shortcode,
                accessibility_caption: alt,
                display_url: image,
                edge_media_preview_like: { count: likes },
                edge_media_preview_comment: { count: comments },
                edge_media_to_caption: {
                    edges: [
                        {
                            node: { text: caption },
                        },
                    ],
                },
            },
        },
    } = data
    const url = `https://www.instagram.com/p/${shortcode}`
    return { owner, caption, image, likes, comments, url, alt }
}

async function getImageHTML(url, attrs = {}, imageOpts = {}) {
    try {
        const stats = await Image(url, {
            urlPath: '/images/instagram/',
            outputDir: './dist/images/instagram/',
            cacheOptions: {
                duration: '1y',
                removeUrlQueryParams: true,
            },
            ...imageOpts,
        })
        const html = Image.generateHTML(stats, {
            loading: 'lazy',
            ...attrs,
        })
        // debug && console.log(html)
        return html
    } catch (e) {
        // return 'testing testing'
        console.error(e)
        return `<img src="${url}" ${
            attrs.alt ? 'alt="' + attrs.alt + '"' : ''
        } ${attrs.class ? 'class="' + attrs.class + '"' : ''} loading="lazy" />`
    }
}
