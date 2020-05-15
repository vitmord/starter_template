const gulp = require("gulp");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const gcmq = require('gulp-group-css-media-queries');
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const fileinclude = require("gulp-file-include");
const del = require("del");
const browserSync = require("browser-sync").create();

const babel = require('gulp-babel');

const imagemin = require('gulp-imagemin');
const webp = require("imagemin-webp");
const svgstore = require("gulp-svgstore");

function style() {
    return gulp
        .src("./src/scss/**/*.scss")
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: "Styles",
                        sound: true,
                        message: err.message
                    };
                })
            })
        )
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(
            autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
                cascade: true
            })
        )
        .pipe(gcmq())
        .pipe(gulp.dest("./build/css/"))
        .pipe(
            cleanCSS({
                compatibility: "ie8"
            })
        )
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./build/css/"))
        .pipe(browserSync.stream());
}

function js() {
    return gulp
        .src("./src/js/**/*.js")
        .pipe(plumber())
        // Transpile the JS code using Babel's preset-env.
        .pipe(babel({
            presets: [
                ['@babel/env', {
                    modules: false
                }]
            ]
        }))
        .pipe(concat("script.js"))
        .pipe(
            uglify({
                // toplevel: true
            })
        )
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest("./build/js"));
}

function html() {
    return gulp
        .src("./src/*.html")
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: "Html include",
                        sound: true,
                        message: err.message
                    };
                })
            })
        )
        .pipe(
            fileinclude({
                prefix: "@@"
            })
        )
        .pipe(gulp.dest("./build"));
}

function imgo() {
    return gulp.src('./src/img/**/*.{png,jpg,JPG,svg}')
        .pipe(
            imagemin(["*.png", "*.jpg"], "img", {
                use: [
                    webp({
                        quality: 75
                    })
                ]
            })
        )
        .pipe(gulp.dest('./build/img'))
        .pipe(gulp.src('./src/img/**/*.{png,jpg,JPG,svg}'))
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imagemin.svgo()
        ]))
        .pipe(imagemin([
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('./build/img'));
};

function sprite() {
    return gulp.src('./src/img/icons/*.svg')
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('./build/img'));
};

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });

    gulp.watch("./src/scss/**/*.scss", style);
    gulp.watch("./src/js/**/*.js", js).on("change", browserSync.reload);
    gulp.watch("./src/**/*.html", html).on("change", browserSync.reload);
    gulp.watch("./src/img/**", imgo).on("change", browserSync.reload);
    gulp.watch("./src/img/icons/**", sprite).on("change", browserSync.reload);
    gulp.watch("./src/fonts/**/*.{woff,woff2}", copy).on("change", browserSync.reload);
}

function copy() {
    return gulp.src([
            './src/fonts/**/*.{woff,woff2}',
            './src/img/**'
        ], {
            base: 'src'
        })
        .pipe(gulp.dest('build'))
}

function clean() {
    return del("build");
}


const build = gulp.series(clean, imgo, sprite, style, js, html);

exports.style = style;
exports.js = js;
exports.html = html;
exports.imgo = imgo;
exports.sprite = sprite;
exports.watch = watch;
exports.clean = clean;
exports.copy = copy;

exports.build = build;
