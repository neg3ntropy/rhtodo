const del = require("del");
const fs = require("fs");
const copy = require("gulp-copy");
const gulp = require("gulp");
const gulpWebpack = require("webpack-stream");
const path = require("path");
const rename = require("gulp-rename");
const ts = require("gulp-typescript");
const webpack = require("webpack");
const zip = require('gulp-zip');

const webpackConfig = require("./webpack.config.js");

const functionsFolder = "src/lambdas";
const lambdas =  fs.readdirSync(functionsFolder)
    .filter(e => fs.statSync(path.join(functionsFolder, e)).isDirectory());

gulp.task("clean", function () {
    return del(["dist"]);
});

gulp.task("ts", ["clean"], function () {
    const tsProject = ts.createProject("tsconfig.json");
    return tsProject.src()
        .pipe(tsProject())
        .once("error", function () {
            this.once("finish", () => process.exit(1));
        })
        .js.pipe(gulp.dest("dist/tsc"))
});

gulp.task("webpack", ["ts"], function () {
    webpackConfig.entry = {};

    for (const folder of lambdas) {
        webpackConfig.entry[folder] = `./dist/tsc/lambdas/${folder}/index.js`;
    }

    return gulpWebpack(webpackConfig, webpack)
        .pipe(gulp.dest("dist/webpack"));
});

gulp.task("webpack", ["ts"], function () {
    webpackConfig.entry = {};

    for (const folder of lambdas) {
        webpackConfig.entry[folder] = `./dist/tsc/lambdas/${folder}/index.js`;
    }

    return gulpWebpack(webpackConfig, webpack)
        .pipe(gulp.dest("dist/webpack"));
});

lambdas.map(l => gulp.task(`${l}_code`, ["webpack"], () =>
    gulp.src(`dist/webpack/${l}.webpack.js`)
        .pipe(rename("index.js"))
        .pipe(gulp.dest(`dist/lambdas/${l}`))
));

lambdas.map(l => gulp.task(`${l}_assets`, ["clean"], () =>
    gulp.src(`assets/**`, {cwd: `${functionsFolder}/${l}`})
        .pipe(copy(`dist/lambdas/${l}`))
));

const zipOptions = {modifiedTime: new Date(0)}; // for repeatable archives
lambdas.map(l => gulp.task(l, [`${l}_code`, `${l}_assets`], () =>
    gulp.src(`dist/lambdas/${l}/**`)
    .pipe(zip(`${l}.zip`, zipOptions))
    .pipe(gulp.dest('dist'))
));

gulp.task("default", lambdas);
