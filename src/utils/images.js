const fs = require('fs');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require("path");
const Image = require("@11ty/eleventy-img");
const sharp = require("sharp");
const getSize = require("image-size");
const glob = require("fast-glob");
const cheerio = require("cheerio");
const shortHash = require('shorthash2');


const imageWidths = [600, 1200, 1800];
const imageFormats = ["avif", "webp", "jpeg"];

// TODO: Check if newer, so keep cache

// EleventyImage defaults to using cache, i'm a dodo brain
// Hopefully eventually it will be able to persist through builds


// get filename, check if avif and webp versions exist. if so, then just skip this shit.
// use hashing?
// whatever it is, get the custom filename type and put it in here

const eleventyProcessImage = async (
  file,
  alt,
  sizes,
  widths = imageWidths,
  outputDir,
  urlPath,
  formats = imageFormats
) => {
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
    sharpJpegOptions: {
      mozjpeg: true,
    },
    sharpAvifOptions: {
      quality: 40,
    },
  });

  console.log(`Made webp and avif versions of ${file}`);
  return Image.generateHTML(imageStats, {
    alt: alt,
    loading: "lazy",
    decoding: "async",
  });
};

// Process Images with Eleventy Image / Sharp. Compression should have already been done with image-min.
module.exports = async function (content, outputPath) {
  if (outputPath.endsWith(".html")) {
    const $ = cheerio.load(content);

    const articleImages = $("main article img").get();

    if (articleImages.length) {
      for (let image of articleImages) {
        let file = $(image).attr("src");
        console.log(file);
        let alt = $(image).attr("alt");
        let urlPath;
        let outputDir;
        // if it begins with a . it's relative
        if (file.startsWith(".")) {
          console.log(`Relative File ${file}`);
          urlPath = `${path.dirname(file)}/`;
          file = path.join(path.dirname(outputPath), file);
          outputDir = `${path.dirname(file)}/`;
        } else if (file.startsWith("/")) {
          //then it's from root of project
          urlPath = `${path.dirname(file)}/`;
          file = `dist${file}`;
          outputDir = `${path.dirname(file)}/`;
        } else if (file.startsWith("http")) {
          // then it's external.
          urlPath = "/images/";
          outputDir = "dist/images/";
        }
        // if it's a GIF, don't bother with eleventy image
        let newHTML = await eleventyProcessImage(
          file,
          alt,
          undefined,
          [null],
          outputDir,
          urlPath
        );
        const $picture = $(newHTML);
        $(image).replaceWith($picture);
      }
    }
    return $.html();
  }
  return content;
};
