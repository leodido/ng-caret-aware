'use strict';

var config = require('../package.json').config;
var path = require('path');

exports.config = {
  multiCapabilities: [
    {
      'browserName': 'chrome'
    },
    /*
    {
      'browserName': 'firefox',
      'marionette': true
    }
    */
  ],

  specs: [
    path.join(__dirname, '..', config.dir.e2e + '/**.scenario.js')
  ],

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true,
    includeStackTrace: true,
    print: function() {}
  },

  params: {
    scenarios: [
      {
        page: 'test/e2e/input.html',
        id: 'input',
        text: '123456789',
        type: 'input'
      },
      {
        page: 'test/e2e/textarea.html',
        id: 'textarea',
        text: 'a\n\n   z',
        type: 'textarea'
      }
    ]
  },

  baseUrl: 'http://127.0.0.1:' + config.server.port,

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: true,
      displayPendingSpec: true
    }));

    browser.getProcessedConfig().then(function(config) {
      browser.name = config.capabilities.browserName;
    });
  }
};
