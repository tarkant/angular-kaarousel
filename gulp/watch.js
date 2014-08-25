'use strict';

var gulp = require('gulp');

gulp.task('watch', ['wiredep', 'styles'] ,function () {
  gulp.watch(['app/styles/**/*.less', 'app/src/**/*.less'], ['styles']);
  gulp.watch(['app/scripts/**/*.js', 'app/app.js', 'app/src/*.js'], ['scripts']);
  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});
