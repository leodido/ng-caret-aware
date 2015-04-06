'use strict';

var bundle = require('./package.json');

exports.config = {
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',

  capabilities: {
    'browserName': 'chrome'
  },

  specs: [
    bundle.directories.e2e + '/**.scenario.js'
  ],

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true,
    includeStackTrace: true,
    print: function() {}
  },

  baseUrl: 'http://127.0.0.1:' + bundle.server.port,

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: true,
      displayPendingSpec: true
    }));
  }
};
