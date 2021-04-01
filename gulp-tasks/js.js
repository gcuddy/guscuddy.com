const { dest, src } = require('gulp');
const gulpEsbuild = require('gulp-esbuild');


// Grabs main.js, bundles and minifies it
const js = () => {
return (
  	src("./src/js/main.js")
  	.pipe(gulpEsbuild({
		  outfile: 'main.js',
		  bundle: true,
		  minify: true
	  }))
  	.pipe(dest('./dist/js'))
  	);
}

module.exports = js;
