const gulp = require('gulp');
const sass = require('gulp-sass');
// const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minify = require('gulp-csso');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require("imagemin-webp");
const extReplace = require("gulp-ext-replace");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const attrsSorter = require('posthtml-attrs-sorter');
const del = require("del");


const browserSync = require('browser-sync').create();

function style() {
    return gulp.src('./source/scss/**/*.scss')
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest('./build/css')) // здесь обычный css
        .pipe(minify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/css')) // здесь .min.css
        .pipe(browserSync.stream())

};

function js() {
    return gulp.src('./source/js/**/*.js')
        .pipe(terser())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/js'))

};

function imgo() {
    return gulp.src('./source/img/**/*.{png,jpg,svg}')
        .pipe(imagemin([
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('./source/imgo'));
};

function goWebp() {
    return gulp.src('./source/img/**/*.{png,jpg}')
        .pipe(imagemin([
            webp({
                quality: 75
            })
        ]))
        .pipe(extReplace(".webp"))
        .pipe(gulp.dest('./source/webp'));
};

function sprite() {
    return gulp.src('./source/img/icon-*.svg')
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('./build/img'));
};

function htmlAttrsSorter() {
    return gulp.src('./source/*.html')
        .pipe(posthtml([
            attrsSorter()
        ]))
        .pipe(gulp.dest('./source'));
};

function html() {
    return gulp.src('./source/*.html')
        .pipe(posthtml([
            include({
                root: 'build/'
            }),
            attrsSorter()
        ]))
        .pipe(gulp.dest('./build'));
};

function watch() {
    browserSync.init({
        server: {
            baseDir: './build/'
        }
    });
    gulp.watch('./source/scss/**/*.scss', style);
    gulp.watch('./source/js/**/*.js', js).on('change', browserSync.reload);
    gulp.watch('./source/*.html', html).on('change', browserSync.reload);
};

// Build tasks

function copy() {
    return gulp.src([
            './source/fonts/**/*.{woff,woff2}',
            './source/img/**',
            './source/js/**',
            './source/**/*.html'
        ], {
            base: 'source'
        })
        .pipe(gulp.dest('build'))
}

function clean() {
    return del('build');
}

const build = gulp.series(clean, copy, style, js, sprite, htmlAttrsSorter, html);

exports.style = style;
exports.js = js;
exports.imgo = imgo;
exports.goWebp = goWebp;
exports.sprite = sprite;
exports.html = html;
exports.htmlAttrsSorter = htmlAttrsSorter;


exports.watch = watch;
exports.copy = copy;
exports.clean = clean;

exports.build = build;
