const { dest, src } = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const debug = require('gulp-debug')
const rename = require('gulp-rename')
const tap = require('gulp-tap')

const isProduction = process.env.NODE_ENV === 'production'
sass.compiler = require('sass')

const components = () => {
    // grab root styles
    return (
        src('./src/_includes/components/**/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(
                cleanCSS(
                    isProduction
                        ? {
                              level: 2,
                          }
                        : {}
                )
            )
            .pipe(debug({ title: 'components:' }))
            // .pipe(rename({ dirname: '' }))
            // .pipe(dest('.src/_includes/components', {}))
            .pipe(dest(file => file.base))
    )
}

module.exports = components
