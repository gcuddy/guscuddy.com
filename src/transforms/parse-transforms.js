const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')
const Image = require('@11ty/eleventy-img')
const path = require('path')
const shortHash = require('shorthash2')
const Cache = require('@11ty/eleventy-cache-assets')

const imageOptions = {
    widths: [1800, 1200, 600],
    formats: ['avif', 'webp', 'jpeg'],
    urlPath: '/images/',
    outputDir: './dist/images/',
    cacheOptions: {
        duration: '7d',
        removeUrlQueryParams: true,
    },
    sharpJpegOptions: {
        mozjpeg: true,
    },
    sharpAvifOptions: {
        quality: 60,
    },
    filenameFormat: (id, src, width, format) => {
        const extension = path.extname(src)
        const name = path.basename(src, extension)

        const stats = fs.statSync(src)

        const hash = shortHash(`${src}|${stats.size}`)

        return `${name}-${hash}-${width}w.${format}`
    },
}

module.exports = async function (value, outputPath) {
    if (outputPath.endsWith('.html')) {
        const DOM = new JSDOM(value, {
            resources: 'usable',
        })

        const document = DOM.window.document

        // Grab all article images
        const articleImages = [...document.querySelectorAll('main article img')]

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
                            // After generating the HTML, we'll check if we have already optimized this file. If not, we'll just run the actual thing.

                            /** Creating a flat array of all the output paths from the stats object. */
                            const outputPaths = Object.keys(stats).reduce(
                                (acc, key) => {
                                    return [
                                        ...acc,
                                        ...stats[key].map(resource => {
                                            return resource.outputPath
                                        }),
                                    ]
                                },
                                []
                            )
                            /** Checking if all output files exists. */
                            let hasImageBeenOptimized = true
                            for (const outputPath of outputPaths) {
                                if (
                                    !fs.existsSync(
                                        path.resolve(
                                            __dirname,
                                            '..',
                                            '..',
                                            outputPath
                                        )
                                    )
                                ) {
                                    hasImageBeenOptimized = false
                                }
                            }
                            if (!hasImageBeenOptimized) {
                                stats = await Image(localPath, imageOptions)
                                console.log(
                                    `Running image optimizations on ${localPath}`
                                )
                            } else {
                                console.log(
                                    `Skipping image optimizations on ${localPath} as it already exists`
                                )
                            }

                            // console.log(parent)

                            // Wrap image in figure if it has an alt or title and use that as figcaption

                            if (
                                parent.tagName !== 'FIGURE' &&
                                image.closest('page-content')
                            ) {
                                if (alt || title) {
                                    imageHtml = `<figure>
                    ${imageHtml}
                    <figcaption>${title || alt}</figcaption>
                    </figure>`
                                    // console.log(imageHtml)
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
                                duration: '14d',
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
                        // image.outerHTML = imageHtml;

                        //let metadata = await Image(file, imageOptions);
                        //console.log(metadata);
                    }
                }
                // replace image with our fancy new html
            }
        }

        return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML
    }
    return value
}
