var fs = require('fs');
var path = require('path');
var del = require('del');
var merge = require('merge-stream');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var nwbuilder = require('node-webkit-builder');
var nw = new nwbuilder({
    files: './*',
    platforms: ['win64']
    // platforms: ['osx32', 'osx64', 'win32', 'win64']
});
var p = require('./package.json')

var buildsPath = './build';


gulp.task('clean-build', function (cb) {
  console.log('cleaning up...');
  del([path.join(buildsPath, '*')], cb);
});

gulp.task('nwbuild', ['clean-build'], function (cb) {
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
   var folders = getFolders(path.join(buildsPath, p.name));
   console.log('packing...');
   console.log(folders);
   var tasks = folders.map(function(folder) {
      return gulp.src(path.join(buildsPath, p.name, folder, '**'))
        .pipe(zip('static-server-' + folder + '.zip'))
        .pipe(gulp.dest(buildsPath))
   });

   return merge(tasks);
});


gulp.task('build', ['clean-build', 'nwbuild', 'zip-builds']);
