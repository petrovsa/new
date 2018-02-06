const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const rsync = require('gulp-rsync');
const sync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgmin');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const jsmin = require('gulp-jsmin');
const cssnext = require("gulp-cssnext");
// HTML

gulp.task('html', () => {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dest'))
        .pipe(sync.stream({
            once: true
        }));
});

// CSS

gulp.task('css', () => {
    return gulp.src('src/css/**/*.css')
        .pipe(plumber())
        .pipe(concat('style.css'))
        .pipe(cssnext())
        .pipe(postcss([autoprefixer]))
        .pipe(csso())
        .pipe(gulp.dest('dest/css'))
        .pipe(sync.stream({
            once: true
        }));
});

// JS

gulp.task('scripts', () => {
    return gulp.src('src/js/*.js')
        .pipe(jsmin())
        .pipe(gulp.dest('dest/js'))
        .pipe(sync.stream({
          once: true
        }));
});

// Images

gulp.task('images', () => {
    return gulp.src('src/img/*.{jpg,png}')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3})
        ]))
        .pipe(gulp.dest('dest/img'));
});

gulp.task('svg', () => {
    return gulp.src('src/img/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('dest/img'));
});

// Copy

gulp.task('copy', () => {
    return gulp.src([
            'src/*',
            'src/fonts/*',
            '!src/img/*',
            '!src/css/*',
            '!src/js/*',
            '!src/*.html'
        ], {
            base: 'src'
        })
        .pipe(gulp.dest('dest'))
        .pipe(sync.stream({
            once: true
        }));
});

// Server

gulp.task('server', () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: 'dest'
        }
    });
});

// Watch

gulp.task('watch:images', () => {
    return gulp.watch('src/img/*.{jpg,png}', gulp.series('images'));
});

gulp.task('watch:svg', () => {
    return gulp.watch('src/img/*.svg', gulp.series('svg'));
});

gulp.task('watch:html', () => {
    return gulp.watch('src/*.html', gulp.series('html'));
});

gulp.task('watch:css', () => {
    return gulp.watch('src/css/**/*.css', gulp.series('css'));
});

gulp.task('watch:scripts', () => {
    return gulp.watch('src/js/*.js', gulp.series('scripts'));
});

gulp.task('watch:copy', () => {
    return gulp.watch([
        'src/*',
        'src/fonts/*',
        '!src/img/*',
        '!src/css/*',
        '!src/js/*',
        '!src/*.html'
    ], gulp.series('copy'));
});

gulp.task('watch', gulp.parallel(
    'watch:images',
    'watch:svg',
    'watch:html',
    'watch:css',
    'watch:scripts',
    'watch:copy'
));

// Build

gulp.task('build', gulp.parallel(
    'images',
    'svg',
    'html',
    'css',
    'scripts',
    'copy'
));

// Deploy

gulp.task('deploy', () => {
	return gulp.src('dest/**')
		.pipe(rsync({
			root: 'dest',
			hostname: 'pitercss.com',
			destination: '/var/www/new/html/',
			recursive: true,
			clean: true,
			incremental: true,
			exclude: '.DS_Store'
		}));
});

// Default

gulp.task('default', gulp.series(
    'build',
    gulp.parallel(
        'watch',
        'server'
    )
));
