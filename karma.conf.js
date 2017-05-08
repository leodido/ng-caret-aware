'use strict';

var bundle = require('./package.json');
var path = require('path');


module.exports = function(config) {
  var cfg = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',

      'bower_components/closure-library/closure/goog/base.js',
      'bower_components/closure-library/closure/goog/deps.js',

      path.join(bundle.directories.source, 'constants.js'),
      path.join(bundle.directories.source, 'selection.typedef.js'),
      path.join(bundle.directories.source, 'caret.controller.js'),
      path.join(bundle.directories.source, 'caretaware.directive.js'),
      path.join(bundle.directories.source, 'module.js'),

      path.join(bundle.directories.unit, '**', '*.spec.js')
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'lib/**/*.js': 'coverage'
    },

    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.txt' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://nprmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],

    // continuous integration mode: if true, karma captures browsers, runs the tests and exits
    singleRun: true
  };

  config.set(cfg);
};
