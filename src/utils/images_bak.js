const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require("path");
const Image = require("@11ty/eleventy-img");
const sharp = require("sharp");
const getSize = require("image-size");
const glob = require('fast-glob');

const imageWidths = [600, 1200, 1800];
const imageFormats = ['avif', 'webp', 'jpeg']

// EleventyImage defaults to using cache, i'm a dodo brain


const eleventyProcessImage = async (file, alt, sizes, widths = imageWidths, outputDir, urlPath, formats = imageFormats) => {

 let imageStats = await Image(file, {
	widths: widths,
	outputDir: outputDir,
	urlPath: urlPath,
	formats: formats,
	cacheOptions: {
		// if a remote image URL, this is the amount of time before it fetches a fresh copy
		duration: "14d",
	
		// project-relative path to the cache directory
		directory: ".cache",
	
		removeUrlQueryParams: false,
	  },
	
 });

 console.log(imageStats);

 return Image.generateHTML(imageStats, {
	 alt: alt,
	 loading: "lazy",
	 decoding: "async"
 })

}

// Process Images with Eleventy Image / Sharp. Compression should have already been done with image-min.
module.exports = async function (content, outputPath) {
  if (outputPath.endsWith(".html")) {
    const DOM = new JSDOM(content, {
      resources: "usable",
    });
    const document = DOM.window.document;
    const articleImages = [...document.querySelectorAll("main article img")];

    if (articleImages.length) {
      for (let image of articleImages) {
        let file = image.getAttribute("src");
		let alt = image.getAttribute("alt");
        // if it begins with a . it's relative
        if (file.startsWith(".")) {
          console.log(`Relative File ${file}`);
		  let urlPath = `${path.dirname(file)}/`
          file = path.join(path.dirname(outputPath), file);
		  let outputDir = `${path.dirname(file)}/`;
		  let newHTML = await eleventyProcessImage(file, alt, undefined, [null], outputDir, urlPath);
		  
		  image.replaceWith(newHTML);
        } else if (file.startsWith("/")) {
          //then it's from root of project
          console.log(`Root file: ${file}, I'll get to you later`);
		  let urlPath = `${path.dirname(file)}/`;
          file = `dist${file}`;
		  
        } else if (file.startsWith("http")) {
          // then it's external.
          console.log(`External: ${file}, we gotta do a lil cache dance`);
        }
      }
    }
    return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML;
  }
  return content;
};
