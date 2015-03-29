'use strict';

exports.config = {

  specs: [
    'test/e2e/**.scenario.js'
  ],

  capabilities: {
    'browserName': 'firefox'
  },

  baseUrl: 'http://localhost:8000/',

  framework: 'jasmine2'

  /*,
  onPrepare: function () {
    require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new jasmine.SpecReporter());
  }
  */

};
