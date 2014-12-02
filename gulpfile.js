'use strict';
var gulp = require('gulp'),
    comp = require('gulp-closure-compiler');

gulp.task('default', function() {
  gulp.src(['lib/*.js'])
    .pipe(comp({
      compilerPath: 'bower_components/closure-compiler/compiler.jar',
      fileName: 'caretaware.js',
      compilerFlags: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT3', // 5_STRICT
        angular_pass: true,
        formatting: 'SINGLE_QUOTES',
        externs: [
          'bower_components/closure-angularjs-externs/index.js',
          'bower_components/closure-w3c-dom1-externs/index.js',
          'bower_components/closure-w3c-dom2-externs/index.js',
          'bower_components/closure-ie-dom-externs/index.js',
          'bower_components/closure-gecko-dom-externs/index.js',
          'bower_components/closure-window-externs/index.js'
        ],
        generate_exports: true,
//        closure_entry_point: 'leodido.directive.CaretAwareModule',
//        only_closure_dependencies: true,
        manage_closure_dependencies: true,
        define: [
          "leodido.constants.DEBUG=false"
        ],
        output_wrapper: '(function(){%output%})();'
      }
    }))
    .pipe(gulp.dest('dist'));
});

// HANDLE ENV
// IF PROD:
// 1) DEBUG=false
// 2) include formatting: 'PRETTY_PRINT' flag


