const fs = require('fs')
const path = require('path')

const getShowPhotos = (photos, page) => {
    if (photos.src.length) {
        return photos.src
    }
    if (photos.directory) {
        const files = fs
            .readdirSync(path.join(__dirname, '..', photos.directory))
            .map(file => path.join(photos.directory, file))
        console.log(files)
        return files
    }
    return []
}

module.exports = {
    eleventyComputed: {
        photos: {
            src: data => getShowPhotos(data.photos, data),
        },
    },
}
