var gulp = require('gulp'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    csso = require('gulp-csso');

gulp.task('default', function() {
    var jsFilter = filter('**/*.js', { restore: true }),
        cssFilter = filter('**/*.css', { restore: true }),
        indexHtmlFilter = filter(['**/*', '!**/index.html'], { restore: true });

    return gulp.src('src/index.html')
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso())
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe(rev())
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace())
        .pipe(gulp.dest('dist'));
});
