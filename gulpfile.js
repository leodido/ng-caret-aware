'use strict';
var gulp = require('gulp'),
  comp = require('gulp-closure-compiler'),
  jshint = require('gulp-jshint'),
  minimist = require('minimist'),
  gutil = require('gulp-util'),
  del = require('del'),
  beautify = require('gulp-jsbeautifier'),
  sequence = require('run-sequence'),
  connect = require('gulp-connect'),
  pack = require('./package.json'),
  banner = [
    '/**',
    ' * Copyright (c) ' + new Date().getFullYear() + ', ' + pack.author.name + ' <' + pack.author.email + '>',
    ' * ' + pack.name + '.js - ' + pack.description,
    ' * @version '+ pack.version,
    ' * @link ' + pack.homepage,
    ' * @license ' + pack.license,
    ' */'
  ].join('\n');
gulp = gulp = require('gulp-help')(gulp, {
  description: 'Display this help text'
});

var knownFlags = {
    'boolean': ['banner'],
    'string': ['env'],
    'default': {
      env: process.env.NODE_ENV || 'production',
      banner: false
    },
    'alias': { e: 'env', b: 'banner' }
  },
  flags = minimist(process.argv.slice(2), knownFlags),
  productionBuild = function(value) {
    switch(value) {
      case 'prod':
      case 'production':
        return true;
      case 'dev':
      case 'development':
        return false;
      default:
        return true;
    }
  };

var build = {
  compiler: './bower_components/closure-compiler/compiler.jar',
  directory: './dist',
  filename: 'caretaware',
  externs: [
    './bower_components/closure-angularjs-externs/index.js',
    './bower_components/closure-w3c-dom1-externs/index.js',
    './bower_components/closure-w3c-dom2-externs/index.js',
    './bower_components/closure-ie-dom-externs/index.js',
    './bower_components/closure-gecko-dom-externs/index.js',
    './bower_components/closure-window-externs/index.js'
  ]
};

gulp.task('version', 'Print the library version', [], function() {
  gutil.log('Library', gutil.colors.magenta(pack.name) + ',', gutil.colors.magenta(pack.version));
});

gulp.task('lint', 'Lint JS source files', [], function() {
  return gulp.src(pack.directories.lib + '/*.js')
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('beauty', false, [], function() {
  gulp.src(pack.directories.lib + '/*.js')
    .pipe(comp({
      compilerPath: build.compiler,
      fileName: build.filename + '.js',
      compilerFlags: {
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT5_STRICT',
        angular_pass: true,
        formatting: ['PRETTY_PRINT', 'SINGLE_QUOTES'],
        generate_exports: true,
        manage_closure_dependencies: true,
        define: [
            'leodido.constants.DEBUG=' + (productionBuild(flags.env) ? 'false' : 'true')
        ],
        output_wrapper: (flags.banner ? banner + '\n': '') + '(function(){%output%})();'
      }
    }))
    .pipe(beautify({ config: './.jsbeautifyrc' }))
    .pipe(gulp.dest(build.directory));
});

// closure_entry_point: 'leodido.directive.CaretAwareModule',
// only_closure_dependencies: true,
gulp.task('compile', false, [], function() {
  gulp.src(pack.directories.lib + '/*.js')
    .pipe(comp({
      compilerPath: build.compiler,
      fileName: build.filename + '.min.js',
      compilerFlags: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT3',
        angular_pass: true,
        formatting: 'SINGLE_QUOTES',
        externs: build.externs,
        generate_exports: true,
        manage_closure_dependencies: true,
        define: [
          'leodido.constants.DEBUG=' + (productionBuild(flags.env) ? 'false' : 'true')
        ],
        output_wrapper: (flags.banner ? banner + '\n': '') + '(function(){%output%})();'
      }
    }))
    .pipe(gulp.dest(build.directory));
});

gulp.task('clean', 'Clean build directory', function(cb) {
  del(build.directory, cb);
});

gulp.task('build', 'Build the library', [], function(cb) {
  sequence(['clean', 'lint'], (productionBuild(flags.env) ? 'compile' : ['beauty', 'compile']), cb);
}, {
  options: {
    'env=production|development': 'Kind of build to perform, defaults to production',
    'banner': 'Prepend banner to the built file'
  }
});

gulp.task('connect', function () {
  connect.server({
    port: 8000,
    livereload: true
  });
});

gulp.task('default', false, ['help']);

// TODO
// [ ] - source map
// [ ] - better beautified release file
