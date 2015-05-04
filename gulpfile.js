'use strict';

var gulp = require('gulp'),
    bump = require('gulp-bump'),
    debug = require('gulp-debug'),
    ccompiler = require('gulp-closure-compiler'),
    gjslint = require('gulp-gjslint'),
    gutil = require('gulp-util'),
    jsonedit = require('gulp-json-editor'),
    rename = require('gulp-rename'),
    minimist = require('minimist'),
    del = require('del'),
    extend = require('node.extend'),
    sequence = require('run-sequence'),
    path = require('path'),
    karma = require('karma').server,
    webserver = require('gulp-webserver'),
    protractor = require('gulp-protractor').protractor,
    webdriverStandalone = require('gulp-protractor').webdriver_standalone,
    webdriverUpdate = require('gulp-protractor').webdriver_update,
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
 * @property {{source: !string, dist: !string, example: !string, unit: !string, e2e: !string}} directories
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
 * prefixes: {dev: string},
 * output: {minified: string, sourcemap: string},
 * externs: string[],
 * sources: *[],
 * release: string
 * }}
 */
var settings = {
  compiler: 'bower_components/closure-compiler/compiler.jar',
  prefixes: {
    dev: 'dev.'
  },
  output: {
    minified: /** @type {string} */ (bundle.main + '.min.js'),
    sourcemap: /** @type {string} */ (bundle.main + '.min.js.map')
  },
  externs: [
    'bower_components/closure-angularjs-externs/index.js',
    'bower_components/closure-angularjs-q_templated-externs/index.js',
    'bower_components/closure-angularjs-http-promise_templated-externs/index.js'
  ],
  sources: [
    'bower_components/closure-library/closure/goog/base.js',
    bundle.directories.source + '/*.js'
  ],
  release: /** @type {string} */ (bundle.directories.release)
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
  var dest = bundle.directories.dist;
  if (!isProduction()) {
    var sourcemap = settings.prefixes.dev + settings.output.sourcemap;
    flags.create_source_map = path.join(dest, sourcemap);
    flags.output_wrapper += '\n//# sourceMappingURL=' + sourcemap;
  }
  return gulp.src(settings.sources)
      .pipe(ccompiler({
        compilerPath: settings.compiler,
        fileName: path.join(dest, (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified),
        compilerFlags: flags
      }))
      .pipe(gulp.dest('./'));
});

// Fix the source array paths of sourcemap file
gulp.task('fix-sourcemap', false, ['compile'], function() {
  var file = path.join(bundle.directories.dist, settings.prefixes.dev + settings.output.sourcemap);
  return isProduction() ?
      true :
      gutil.log('Writing', file + '.fix') &&
      gulp.src(file)
          .pipe(jsonedit(function(json) {
            var root = path.relative(bundle.directories.dist, './');
            json['sources'] = json['sources'].map(function(o) {
              return path.join(root, o);
            });
            json['sources'].forEach(function(src) {
              gutil.log('Updated sourcemap source path:', src);
            });
            return json;
          }))
          .pipe(rename(file + '.fix'))
          .pipe(gulp.dest('./'));
});

gulp.task('del-sourcemap', false, ['fix-sourcemap'], function() {
  var file = path.join(bundle.directories.dist, settings.prefixes.dev + settings.output.sourcemap);
  return isProduction() ?
      true :
      gutil.log('Deleted', path.relative('./', del.sync([file])[0]));
});

gulp.task('upd-sourcemap', false, ['del-sourcemap'], function() {
  var file = path.join(bundle.directories.dist, settings.prefixes.dev + settings.output.sourcemap);
  return isProduction() ?
      true :
      gutil.log('Copying', file + '.fix', 'to', file) &&
      gulp.src([file + '.fix'])
          .pipe(rename(file))
          .pipe(gulp.dest('./'));
});

gulp.task('dist', false, ['upd-sourcemap'], function() {
  var file = path.join(bundle.directories.dist, settings.prefixes.dev + settings.output.sourcemap);
  return isProduction() ?
      true :
      gutil.log('Deleted', path.relative('./', del.sync([file + '.fix'])[0]));
});

gulp.task('build', 'Build the library', [], function(cb) {
  sequence(['clean', 'lint'], 'dist', cb);
}, {
  options: extend(bannerHelp.options, environmentsHelp.options)
});

gulp.task('clean', 'Clean build directory', function(cb) {
  var hello = [
    path.join(bundle.directories.dist, (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified)
  ];
  if (!isProduction()) {
    hello.push(path.join(bundle.directories.dist, settings.prefixes.dev + settings.output.sourcemap));
  }
  hello.forEach(function(filepath) {
    gutil.log('Deleting', filepath);
  });

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

gulp.task('karma', 'Run karma tests', [], function(done) {
  karma.start(
      {
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
      },
      done
  );
});

var stream;
gulp.task('connect', false, [], function() {
  stream = gulp.src(__dirname)
      .pipe(webserver({
        port: bundle.server.port,
        directoryListing: true
      }));
});

// Update/install webdriver
gulp.task('webdriver:update', false, [], webdriverUpdate);

// Run webdriver standalone server indefinitely. Usually not required.
gulp.task('webdriver:standalone', false, ['webdriver:update'], webdriverStandalone);

gulp.task('protractor', 'Run protractor E2E tests', ['connect', 'webdriver:update'], function() {
  gulp.src(bundle.directories.e2e + '/**.scenario.js')
      .pipe((protractor({
        configFile: __dirname + '/protractor.conf.js'
      })).on('error', function(e) {
        throw e;
      })).on('end', function() {
        stream.emit('kill');
      });
});

gulp.task('default', false, ['help']);
