const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const path = require("path");
const shortHash = require("shorthash2");

const imageOptions = {
  widths: [1920, 1280, 640, 320],
  formats: ["jpeg", "avif", "webp"],
  urlPath: "/images/",
  outputDir: "./dist/images/",
  cacheOptions: {
    duration: "7d",
    removeUrlQueryParams: true,
  },
  sharpJpegOptions: {
      mozjpeg: true,
  },
  sharpAvifOptions: {
      quality: 40,
  },
  filenameFormat: (id, src, width, format) => {
    const extension = path.extname(src);
    const name = path.basename(src, extension);

    const stats = fs.statSync(src);

    const hash = shortHash(`${src}|${stats.size}`);

    return `${name}-${hash}-${width}w.${format}`;
  },
};

module.exports = async function (value, outputPath) {
  if (outputPath.endsWith(".html")) {
    const DOM = new JSDOM(value, {
      resources: "usable",
    });

    const document = DOM.window.document;

    // Grab all article images
    const articleImages = [...document.querySelectorAll("main article img")];

    const articleEmbeds = [...document.querySelectorAll("main article iframe")];

    if (articleImages.length) {
      for (let image of articleImages) {
        /*
                TODO: make picture element
                TODO: cache images
                TODO: optimize images

                */
        const file = image.getAttribute("src");

        if (file.indexOf("http") < 0) {
          // It's a remote image
        } else {
          // It's a local image

          const stats = Image.statsSync(file, imageOptions);

          /** Creating a flat array of all the output paths from the stats object. */
          const outputPaths = Object.keys(stats).reduce((acc, key) => {
            return [
              ...acc,
              ...stats[key].map((resource) => {
                return resource.outputPath;
              }),
            ];
          }, []);
          /** Checking if all output files exists. */
          let hasImageBeenOptimized = true;
          for (const outputPath of outputPaths) {
              /* TODO: fix this output file path resolving dependent on file */
            if (
              !fs.existsSync(path.resolve(__dirname, "..", "..", outputPath))
            ) {
              hasImageBeenOptimized = false;
            }
          }
          if (!hasImageBeenOptimized) {
            Image(src, imageOptions);
          }
        }

      }
    }

    return "<!DOCTYPE html>\r\n" + document.documentElement.outerHTML;
  }
  return value;
};
