const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')
const Image = require('@11ty/eleventy-img')
const path = require('path')

const imageOptions = {
    widths: [1800, 1200, 600],
    formats: ['avif', 'webp', 'jpeg'],
    urlPath: '/images/',
    outputDir: './dist/images/',
    cacheOptions: {
        duration: '30d',
        removeUrlQueryParams: true,
    },
    sharpJpegOptions: {
        mozjpeg: true,
    },
    sharpAvifOptions: {
        quality: 60,
    },
}

module.exports = async function (value, outputPath) {
    if (outputPath.endsWith('.html')) {
        const DOM = new JSDOM(value, {
            resources: 'usable',
        })

        const document = DOM.window.document

        // Grab all article images (that don't contain "tweet" in their class, since I'm doing those separately)
        // Ideally have a better way to do this to future-proof it to avoid adding on :not selectors
        const articleImages = [
            ...document.querySelectorAll(
                'main article img:not([class*="tweet"])'
            ),
        ]

        const articleEmbeds = [
            ...document.querySelectorAll('main article iframe'),
        ]

        if (articleImages.length) {
            for (let image of articleImages) {
                const file = image.getAttribute('src').trim()
                const alt = image.getAttribute('alt')
                const cls = image.getAttribute('class')
                const title = image.getAttribute('title')
                const style = image.getAttribute('style')
                const parent = image.parentElement

                // if the parent element is a picture element, let's skip it
                if (parent.tagName === 'PICTURE') {
                    continue
                }

                let imageHtml
                // TODO: better sizes?
                let sizes = '100vw'
                let imageAttributes = {
                    alt,
                    sizes,
                    loading: 'lazy',
                    decoding: 'async',
                }
                if (cls) {
                    imageAttributes.class = cls
                }
                if (style) {
                    imageAttributes.style = style
                }

                // TODO: Refactor this to be DRY

                if (file) {
                    if (!file.startsWith('http')) {
                        // It's a local image

                        let localPath = './dist' + file

                        if (file.startsWith('.') || !file.startsWith('/')) {
                            localPath = path.resolve(
                                __dirname,
                                '..',
                                '..',
                                path.dirname(outputPath),
                                file
                            )
                        }

                        // let's only proceed if it actually exists. otherwise we'll get errors.
                        if (fs.existsSync(localPath)) {
                            let stats = Image.statsSync(localPath, imageOptions)

                            // Now let's generate the HTML.
                            imageHtml = Image.generateHTML(
                                stats,
                                imageAttributes
                            )

                            // todo: figure out what I was doing here lol
                            stats = await Image(localPath, imageOptions)

                            // Wrap image in figure if it has an alt or title and use that as figcaption

                            if (
                                parent.tagName !== 'FIGURE' &&
                                image.closest('page-content')
                            ) {
                                if (alt || title) {
                                    imageHtml = `<figure>
                                                    ${imageHtml}
                                                    <figcaption>${
                                                        title || alt
                                                    }</figcaption>
                                                </figure>`
                                }
                            }

                            if (
                                parent.tagName === 'P' &&
                                parent.querySelector('img:only-child')
                            ) {
                                parent.outerHTML = imageHtml
                            } else {
                                image.outerHTML = imageHtml
                            }

                            // TODO: fix the generated HTML to not put Jpeg in sources, it's screwing things up!
                        }
                    } else {
                        // It's a remote image, so we need to cache the download (eleventy-image does this automatically, but not with statsync)
                        let url = file
                        let stats = await Image(url, {
                            widths: [1800, 1200, 600],
                            formats: ['avif', 'webp', 'jpeg'],
                            urlPath: '/images/',
                            outputDir: './dist/images/',
                            cacheOptions: {
                                duration: '30d',
                                removeUrlQueryParams: true,
                            },
                            sharpJpegOptions: {
                                mozjpeg: true,
                            },
                            // sharpAvifOptions: {
                            //   quality: 60,
                            // },
                            // sharpWebpOptions: {
                            //   quality: 60,
                            // },
                        })
                        imageHtml = Image.generateHTML(stats, imageAttributes)
                        const parent = image.parentElement

                        if (
                            parent.tagName !== 'FIGURE' &&
                            image.closest('.page-content')
                        ) {
                            if (alt || title) {
                                imageHtml = `<figure>
                                                ${imageHtml}
                                                <figcaption>${
                                                    title || alt
                                                }</figcaption>
                                            </figure>`
                            }
                        }

                        if (parent.querySelector('img:only-child')) {
                            parent.outerHTML = imageHtml
                        } else {
                            image.outerHTML = imageHtml
                        }
                    }
                }
            }
        }

        return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML
    }
    return value
}
