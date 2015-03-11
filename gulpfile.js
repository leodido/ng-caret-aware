'use strict';

var gulp = require('gulp'),
    bump = require('gulp-bump'),
    debug = require('gulp-debug'),
    ccompiler = require('gulp-closure-compiler'),
    gjslint = require('gulp-gjslint'),
    gutil = require('gulp-util'),
    minimist = require('minimist'),
    del = require('del'),
    extend = require('node.extend'),
    beautify = require('gulp-jsbeautifier'),
    sequence = require('run-sequence'),
    connect = require('gulp-connect'),
    allowedLevels = ['major', 'minor', 'patch', 'prerelease'],
    allowedEnvironments = ['production', 'development'],
    knownArgs = {
      'boolean': ['banner'],
      'string': ['env', 'level'],
      'default': {
        env: process.env.NODE_ENV || allowedEnvironments[0],
        banner: false,
        level: allowedLevels[2]
      },
      'alias': { e: 'env', b: 'banner' }
    };


/**
 * @typedef {Object} GulpArguments
 * @property {!boolean} banner
 * @property {!string} env
 * @property {!string} level
 */
var GulpArguments;


/** @type {GulpArguments} */
var args = minimist(process.argv.slice(2), knownArgs),
    bannerHelp = { options: {} },
    environmentsHelp = { options: {} },
    levelsHelp = { options: {} };
var getLevel = function() {
  if (allowedLevels.indexOf(args.level) === -1) {
    args.level = knownArgs.default.level;
  }
  return args.level;
};
var getEnv = function() {
  if (allowedEnvironments.indexOf(args.env) === -1) {
    args.env = knownArgs.default.env;
  }
  return args.env;
};
var isProduction = function() {
  return getEnv() === allowedEnvironments[0];
};
levelsHelp.options['level=' + allowedLevels.join('|')] = 'Version level to increment';
environmentsHelp.options['env=' + allowedEnvironments.join('|')] = 'Kind of build to perform, defaults to production';


/**
 * @type {string}
 */
bannerHelp.options.banner = 'Prepend banner to the built file';


/**
 * @typedef {*} PackageJson
 * @property {!string} name
 * @property {!string} description
 * @property {!string} license
 * @property {!string} homepage
 * @property {!string} version
 * @property {!string} main
 * @property {{source: !string, example: !string}} directories
 * @property {{name: !string, email: !string}} author
 */
var PackageJson;


/** @type {PackageJson} */
var bundle = require('./package.json'),
    banner = [
      '/**',
      ' * Copyright (c) ' + new Date().getFullYear() + ', ' + bundle.author.name + ' <' + bundle.author.email + '>',
      ' * ' + bundle.main + ' - ' + bundle.description,
      ' * @version ' + bundle.version,
      ' * @link ' + bundle.homepage,
      ' * @license ' + bundle.license,
      ' */'
    ].join('\n');


/**
 * @type {!string}
 */
bundle.main = bundle.main.split('.').slice(0, -2).join('.');

gulp = gulp = require('gulp-help')(gulp, {
  description: 'Display this help text'
});


/**
 * @type {{
 * compiler: string,
 * prefixes: {dev: !string},
 * output: {beautified: !string, minified: !string, sourcempa: !string},
 * externs: string[],
 * sources: string[],
 * release: !string
 * }}
 */
var settings = {
  compiler: 'bower_components/closure-compiler/compiler.jar',
  prefixes: {
    dev: 'dev.'
  },
  output: {
    beautified: bundle.main + '.js',
    minified: bundle.main + '.min.js',
    sourcemap: bundle.main + '.min.js.map'
  },
  externs: [
    'bower_components/closure-angularjs-externs/index.js',
    'bower_components/closure-angularjs-q_templated-externs/index.js',
    'bower_components/closure-angularjs-http-promise_templated-externs/index.js'
  ],
  sources: [
//    'bower_components/closure-library/closure/goog/base.js',
//    'bower_components/closure-library/closure/goog/string/string.js',
//    'bower_components/closure-library/closure/goog/debug/error.js',
//    'bower_components/closure-library/closure/goog/dom/nodetype.js',
//    'bower_components/closure-library/closure/goog/asserts/asserts.js',
//    'bower_components/closure-library/closure/goog/array/array.js',
//    'bower_components/closure-library/closure/goog/labs/useragent/util.js',
//    'bower_components/closure-library/closure/goog/object/object.js',
//    'bower_components/closure-library/closure/goog/labs/useragent/browser.js',
//    'bower_components/closure-library/closure/goog/labs/useragent/engine.js',
//    'bower_components/closure-library/closure/goog/labs/useragent/platform.js',
//    'bower_components/closure-library/closure/goog/useragent/useragent.js',
//    'bower_components/closure-library/closure/goog/dom/selection.js',
    bundle.directories.source + '/*.js'
  ],
  release: bundle.directories.release
};

gulp.task('lint', 'Lint JS source files', [], function() {
  var lintOptions = {
    flags: [
      '--flagfile=gjslint.conf'
    ]
  };
  return gulp.src(settings.sources)
      .pipe(debug({ title: 'Lint' }))
      .pipe(gjslint(lintOptions))
      .pipe(gjslint.reporter('console'), { fail: true });
});

gulp.task('simple-compile', false, [], function() {
  return gulp.src(settings.sources)
      .pipe(debug({ title: 'Input' }))
      .pipe(ccompiler({
        compilerPath: settings.compiler,
        fileName: settings.output.beautified,
        compilerFlags: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT',
          angular_pass: true,
          formatting: ['PRETTY_PRINT', 'SINGLE_QUOTES'],
          generate_exports: true,
          manage_closure_dependencies: true,
          define: [
            'leodido.constants.DEBUG=' + (isProduction() ? 'false' : 'true')
          ],
          output_wrapper: (args.banner ? banner + '\n' : '') + '(function(){%output%})();'
        }
      }));
});

gulp.task('beauty', false, ['simple-compile'], function() {
  return gulp.src(settings.output.beautified)
      .pipe(beautify({ config: './.jsbeautifyrc' }))
      .pipe(gulp.dest('./'));
});

gulp.task('compile', false, [], function() {
  var flags = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    language_in: 'ECMASCRIPT3',
    angular_pass: true,
    formatting: 'SINGLE_QUOTES',
    externs: settings.externs,
    generate_exports: true,
    manage_closure_dependencies: true,
    output_wrapper: (args.banner ? banner + '\n' : '') + '(function(){%output%})();',
    define: [
      'leodido.constants.DEBUG=' + (isProduction() ? 'false' : 'true')
    ],
    warning_level: 'VERBOSE'
  };
  if (!isProduction()) {
    var sourcemap = settings.prefixes.dev + settings.output.sourcemap;
    flags.create_source_map = sourcemap;
    flags.output_wrapper += '\n//# sourceMappingURL=' + sourcemap;
  }
  gulp.src(settings.sources)
      .pipe(ccompiler({
        compilerPath: settings.compiler,
        fileName: (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified,
        compilerFlags: flags
      }));
});

gulp.task('build', 'Build the library', [], function(cb) {
  //sequence(['clean', 'lint'], (isProduction() ? 'compile' : ['beauty', 'compile']), cb); // FIXME: beautified disabled
  sequence(['clean', 'lint'], 'compile', cb);
}, {
  options: extend(bannerHelp.options, environmentsHelp.options)
});

gulp.task('connect', function() {
  connect.server({
    port: 8000,
    livereload: true
  });
});

gulp.task('clean', 'Clean build directory', function(cb) {
  var hello = [
    settings.output.beautified,
    (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified
  ];
  if (!isProduction()) {
    hello.push(settings.prefixes.dev + settings.output.sourcemap);
  }

  del(hello, cb);
}, environmentsHelp);

gulp.task('version', 'Print the library version', [], function() {
  return gutil.log('Library', gutil.colors.magenta(bundle.name) + ',', gutil.colors.magenta(bundle.version));
});

gulp.task('bump', 'Bump version up for a new release', function() {
  return gulp.src(['./bower.json', 'package.json'])
      .pipe(bump({ type: getLevel() }))
      .pipe(gulp.dest('./'));
}, levelsHelp);

gulp.task('default', false, ['help']);

// TODO
// [ ] - better beautified release file
