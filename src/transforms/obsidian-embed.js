const fg = require('fast-glob')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

module.exports = async function (value, outputPath) {
    if (outputPath.includes('/notes/') && outputPath.endsWith('.html')) {
        // let regex = /!(\[\[|<a href=".+">)(.+)(\]\]|\<\/a\>)/gm;

        // let matches = [...value.matchAll(regex)];
        // if (matches.length > 0) {
        //   for (let match of matches) {
        //     let fileName = match[2];
        //     const file = await fg(`./dist/notes/**/${fileName}`);
        //     let path = file.replace("./dist", "");
        //     // need to figure out how to change link
        //   }
        // }
        const DOM = new JSDOM(value, {
            resources: 'usable',
        })
        const document = DOM.window.document

        // get links that aren't heading anchors
        const articleLinks = [
            ...document.querySelectorAll('main article a:not(.heading-anchor)'),
        ]
        const imgRegex = /^.+\.(png|jpg|jpeg|gif|tiff|avif|webp|webm)/gim
        if (articleLinks.length) {
            let imgLinks = articleLinks.filter(l => imgRegex.test(l.innerHTML))
            for (let link of imgLinks) {
                link.outerHTML = `<img src="/images/${link.innerHTML}" alt=""`
            }
            return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML
        }
        return value
    }
    return value
}

// Could I do this in Tranforms?
