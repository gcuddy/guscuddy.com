const fetch = require('node-fetch')
const Cache = require('@11ty/eleventy-cache-assets')
const MagicString = require('magic-string')
const dayjs = require('dayjs')
const queryIA = require('./query-ia')
// const { minify } = require('html-minifier')
require('dotenv').config()

const kFormatter = num =>
    Math.abs(num) > 999
        ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
        : Math.sign(num) * Math.abs(num)

async function buildQuoteTweet(data) {
    if (!data.is_quote_status) return undefined
    const quote = {}
    quote.url = data.quoted_status_permalink.expanded
    const status = data.quoted_status
    if (!status) {
        const ia = await queryIA(quote.url)
        if (ia) {
            return `<div class="quoted-tweet"><p>This tweet has been deleted. You can try <a href="${ia}">this internet archive snapshot</a>, though!</p></div>`
        } else {
            return `<div class="quoted-tweet"><p>This tweet has been deleted.</p></div>`
        }
    }
    quote.text = status.full_text
    quote.username = status.user.screen_name
    quote.displayName = status.user.name
    return `<div class="quoted-tweet"><a href="${quote.url}"><div class="username"><span class="quote-tweet-displayname">${quote.displayName}</span><span class="quote-tweet-username">@${quote.username}</span></div><p>${quote.text}</p></a></div>`
}

function buildMediaHTML(media) {
    if (media.length < 1) return undefined
    let html = ''
    for (let item of media) {
        if (item.type === 'photo') {
            html += `<a class="tweet-photo-link" href="${item.link}"><img loading="lazy" class="tweet-photo" src="${item.url}" alt=""></a>`
        } else if (item.type === 'video') {
            html += `<video controls="" src="${item.url}" class="tweet-video" type="video/mp4"></video>`
        } else if (item.type === 'animated_gif') {
            html += `<video controls="" autoplay muted loop playsinline src="${item.url}" class="tweet-gif"></video>`
        }
    }
    return html
}

const fetchTweet = async id => {
    const tweetURL = `https://api.twitter.com/1.1/statuses/show.json?id=${id}&tweet_mode=extended`
    try {
        return await Cache(tweetURL, {
            duration: '14d',
            type: 'json',
            fetchOptions: {
                headers: {
                    Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
                },
            },
        })
    } catch (e) {
        return undefined
    }
}

/**
 * Takes tweet id and builds full "fake" twitter embed.
 *
 * @param {string} tweet_id - the id of the tweet
 * @returns html of fake tweet <embed src="" type="" />
 */

module.exports = async (tweet_id, username) => {
    const data = await fetchTweet(tweet_id)
    const url = `https://twitter.com/${username}/status/${tweet_id}`
    if (!data) {
        const ia = await queryIA(url)
        if (ia) {
            return `<div class="deleted-tweet"><p>This tweet by <a href="https://twitter.com/${username}">@${username}</a> has been deleted. You can try <a href="${ia}">this internet archive snapshot</a>, though!</p></div>`
        } else {
            return `<div class="deleted-tweet"><p>This tweet by <a href="https://twitter.com/${username}">@${username}</a> has been deleted. Argh, sorry about that!</p></div>`
        }
    }
    const fullText = new MagicString(data.full_text)
    // First, expand URLs
    if (data.entities?.urls?.length > 0) {
        // replace urls with expanded versions
        for (let url of data.entities.urls) {
            fullText.overwrite(url.indices[0], url.indices[1], url.expanded_url)
        }
    }
    // Link Mentioned Uers
    if (data.entities?.user_mentions?.length > 0) {
        for (let mention of data.entities.user_mentions) {
            let html = `<a class="user-mention" href="https://twitter.com/${mention.screen_name}">@${mention.screen_name}</a>`
            fullText.overwrite(mention.indices[0], mention.indices[1], html)
        }
    }
    // Add class to hashtags
    if (data.entities?.hashtags?.length > 0) {
        for (let hashtag of data.entities.hashtags) {
            let html = `<a class="hashtag" href="https://twitter.com/hashtag/${hashtag.text}">#${hashtag.text}</a>`
            fullText.overwrite(hashtag.indices[0], hashtag.indices[1], html)
        }
    }
    // Add photos to media array
    const media = []
    if (data.extended_entities?.media?.length > 0) {
        let [start, end] = data.extended_entities.media[0].indices
        fullText.remove(start, end)
        for (let item of data.extended_entities.media) {
            // Three different types: photo, video, animated GIF
            if (item.type == 'photo') {
                media.push({
                    type: 'photo',
                    url: item.media_url_https,
                    link: item.expanded_url,
                })
            } else if (item.type == 'video') {
                // select highest bitrate?
                const sortedVideos = [...item.video_info.variants]
                sortedVideos
                    .sort((a, b) => b.bitrate - a.bitrate)
                    .filter(e => e.content_type == 'video/mp4')
                let videoSrc = sortedVideos[0].url
                media.push({ type: 'video', url: videoSrc })
            } else if (item.type == 'animated_gif') {
                media.push({
                    type: 'animated_gif',
                    url: item.video_info.variants[0].url,
                })
            }
        }
    }
    const mediaHTML = buildMediaHTML(media)
    // Quoted tweet
    const quote = await buildQuoteTweet(data)
    // Now remove the link from the fullText
    var tweetBody = fullText.toString()
    if (quote) {
        let quoteURL = data.quoted_status_permalink.expanded
        tweetBody = tweetBody.replace(quoteURL, '')
    }
    const tweetBodyHTML = tweetBody
        .split('\n\n')
        .filter(l => l.length > 0)
        .map(i => `<p>${i.replace('\n', '<br>')}</p>`)
        .join('')
    // Build HTML
    const html = `<div class="[ tweet ] [ flow ]">
    <div class="tweet__header"><a href="${url}"><img loading="lazy" class="tweet__header-avatar" src="${
        data.user.profile_image_url_https
    }" alt="Twitter avatar for @${
        data.user.screen_name
    }"><span class="tweet__header-name">${
        data.user.name
    }</span><span class="tweet__header-username">@${
        data.user.screen_name
    }</span></a></div>
    <div class="[ tweet__body ] [ flow ]">
        ${tweetBodyHTML}
        ${mediaHTML ? mediaHTML : ''}
        ${quote ? quote : ''}
    </div>
    <div class="tweet__footer">
    <a href="${url}">
        <p class="tweet-date">${dayjs(data.created_at).format(
            'MMMM D, YYYY'
        )}</p>
        <span class="retweets">
            <span class="retweets-count">${kFormatter(
                data.retweet_count
            )}</span> Retweets
        </span>
        <span class="likes">
            <span class="likes-count">${kFormatter(
                data.favorite_count
            )}</span> Likes
        </span>
        </a>
    </div>
    </div>`
    return html
}
