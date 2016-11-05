
// Gulp Dependencies

var babel = require("gulp-babel");
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var gulp = require("gulp");
var include = require("gulp-include");
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

// Define source paths

var paths = {

	scripts: {
		watch: ['./js/**/*.js'],
		compile: ['./js/*.js']
	},

	css: {
		watch: ['./scss/**/*.scss'],
		compile: ['./scss/*.scss']
	}

};

/**
 * TASK - Compile and combine CSS
 */
gulp.task("compile-css", function () {
	return gulp.src(paths.css.compile)
	.pipe(plumber())
	.pipe(sass.sync())
	.pipe(cleanCSS({ keepSpecialComments: 1 }))
	.pipe(concat('sergio.min.css'))
	.pipe(plumber.stop())
	.pipe(gulp.dest("./dist"));
});

/**
 * TASK - Combine, make compatible and compress js app scripts
 */
gulp.task("compile-scripts", function () {

	return gulp.src(paths.scripts.compile)
	.pipe(plumber())
	.pipe(include({ extensions: 'js' }))
	.pipe(babel())
	.pipe(uglify({ preserveComments: 'license'}))
	.pipe(concat('sergio.min.js'))
	.pipe(plumber.stop())
	.pipe(gulp.dest("./dist"));

});

/**
 * TASK - Starts watchers
 */
gulp.task('default', function() {
	gulp.watch([paths.scripts.watch], ['compile-scripts']);
	gulp.watch([paths.css.watch], ['compile-css']);
});
