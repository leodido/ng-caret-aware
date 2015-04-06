'use strict';

/* global browser, element, expect */
describe('input', function() {
  var el,
      attrVal = 'cursor';
  beforeEach(function() {
    browser.get('example/input01.html');
    el = element(by.id('input00'));
  });

  it('should have directive attribute with "' + attrVal + '" value', function() {
    el.getAttribute('data-caret-aware').then(function(attr) {
      expect(typeof attr).toBe('string');
      expect(attr).toEqual(attrVal);
    });
  });

  xit('should move caret forward when text is inserted', function() {

  });

  xit('should move caret backward when text is deleted', function() {

  });

//    var text = '123456789';
//    var el = element(by.css('[data-caret-aware~=cursor]'));
//    console.log(el);
//    el.sendKeys(text);
});
