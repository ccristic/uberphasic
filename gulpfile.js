var gulp = require("gulp");
var less = require('gulp-less');

gulp.task('compile-less', function () {
	return gulp.src('./less/**/*.less')
	.pipe(less())
	.pipe(gulp.dest('./less'))
});

gulp.task('watch', function () {
	gulp.watch('./less/**/*.less', ['compile-less']);
});

gulp.task('default', ['watch']);
