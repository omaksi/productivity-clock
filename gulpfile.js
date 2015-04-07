var fs = require('fs');
var path = require('path');
var del = require('del');
var async = require('async');
var merge = require('merge-stream');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var nwbuilder = require('node-webkit-builder');
var p = require('./package.json');

var config = {
  sourcePath: './**',
  targetPath: './build',
  platforms: ['win64', 'osx64'], // ['osx32', 'osx64', 'win32', 'win64']
  cleanCache: true,
  cleanUnzipped: false
}

var nw = new nwbuilder({
    files: config.sourcePath,
    platforms: config.platforms
});

gulp.task('clean-pre', function (cb) {
  console.log('cleaning up...');
  del([path.join(config.targetPath, '*')], cb);
});

gulp.task('nwbuild', ['clean-pre'], function (cb) {
  console.log('building...');
  nw.build().then(function () {
     console.log('building done!');
     cb();
  }).catch(function (error) {
      console.error(error);
  });
});

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

gulp.task('zip-builds', ['nwbuild'], function() {
  //  console.log(p.name);
   var folders = getFolders(path.join(config.targetPath, p.name));
   console.log('packing...');
   console.log(folders);
   var tasks = folders.map(function(folder) {
      return gulp.src(path.join(config.targetPath, p.name, folder, '**'))
        .pipe(zip(p.name + '-' + folder + '.zip'))
        .pipe(gulp.dest(config.targetPath))
   });

   return merge(tasks);
});

gulp.task('clean-after', ['zip-builds'], function (cb) {
  console.log('cleaning up...');
  var tasks = []

  if (config.cleanCache === true){
    tasks.push(function(asynccb){
      del(['./cache'], asynccb);
    });
  }

  if (config.cleanUnzipped === true){
    tasks.push(function(asynccb){
      del([path.join(config.targetPath, p.name)], asynccb);
    });
  }

  async.parallel(tasks, cb);
});


gulp.task('build', ['clean-pre', 'nwbuild', 'zip-builds', 'clean-after']);
