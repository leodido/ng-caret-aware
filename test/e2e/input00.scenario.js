/* global browser, element, by, expect */
describe(
  'input with named caret',
  function () {
    'use strict';
    it('should stocazzo', function () {

      browser.get('example/input00.html');
      var text = 'ciao';
      var el = element(by.css('[data-caret-aware~=cursor]'));
//      el.sendKeys(test);

//      expect(el.getAttribute('value')).toEqual(text);

      //    element(by.model('ourName')).sendKeys('Julie');
      //    var greeting = element(by.binding('yourName'));
      //    expect(greeting.getText()).toEqual('Hello Julie!');

    });
  });
