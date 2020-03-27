const gulp = require("gulp");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
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

const posthtml = require("gulp-posthtml");
const attrsSorter = require('posthtml-attrs-sorter');

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
        .pipe(posthtml([
            attrsSorter()
        ]))
        .pipe(
            fileinclude({
                prefix: "@@"
            })
        )
        .pipe(gulp.dest("./build"));
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });

    gulp.watch("./src/scss/**/*.scss", style);
    gulp.watch("./src/js/**/*.js", js).on("change", browserSync.reload);
    gulp.watch("./src/**/*.html", html).on("change", browserSync.reload);
}

function clean() {
    return del("build");
}

function htmlAttrsSorter() {
    return gulp.src('./source/*.html')
        .pipe(posthtml([
            attrsSorter()
        ]))
        .pipe(gulp.dest('./source'));
};

const build = gulp.series(clean, style, js, htmlAttrsSorter, html);

exports.style = style;
exports.js = js;
exports.html = html;
exports.htmlAttrsSorter = htmlAttrsSorter;
exports.watch = watch;
exports.clean = clean;

exports.build = build;
