const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileinclude = require("gulp-file-include");
const del = require("del");
const browserSync = require("browser-sync").create();

// browser-sync

gulp.task("watch", function() {
  browserSync.init({
    server: {
      baseDir: "./build"
    }
  });
  gulp
    .watch("./src/scss/**/*.scss")
    .on("change", gulp.series("style", browserSync.reload));
  gulp
    .watch("./src/html/**/*.html")
    .on("change", gulp.series("html", browserSync.reload));
  gulp
    .watch("./src/images/**/*.*")
    .on("change", gulp.series("copy:img", browserSync.reload));
  gulp
    .watch("./src/js/**/*.*")
    .on("change", gulp.series("copy:js", browserSync.reload));
});

// scss
gulp.task("style", function(cb) {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
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
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./build/css/"));
  cb();
});

// Сборка HTML из шаблонов (gulp-file-include)
gulp.task("html", function(cb) {
  return gulp
    .src("./src/html/*.html")
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
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
  cb();
});

gulp.task("copy:img", function(cb) {
  return gulp.src("./src/img/**/*.*").pipe(gulp.dest("./build/img"));
  cb();
});

gulp.task("copy:js", function(cb) {
  return gulp.src("./src/js/**/*.*").pipe(gulp.dest("./build/js"));
  cb();
});

gulp.task(
  "default",
  gulp.series(
    gulp.parallel("html", "style", "copy:img", "copy:js"),
    gulp.parallel("watch")
  )
);
