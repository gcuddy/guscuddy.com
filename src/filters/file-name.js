const path = require('path')

module.exports = inputPath => {
    return path.parse(inputPath).name
}
