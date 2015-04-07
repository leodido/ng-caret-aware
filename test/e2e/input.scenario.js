'use strict';

/* global browser, element, expect */
describe('caret aware input', function() {
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

  it('should caret have to be initialized to 0 and not movable', function() {
    el.evaluate(attrVal).then(function(pos) {
      expect(pos).toEqual(0);
      el.sendKeys(protractor.Key.END);

      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
        el.sendKeys(protractor.Key.UP);

        el.evaluate(attrVal).then(function(pos) {
          expect(pos).toEqual(0);
        });
      });
    });
  });

  describe('should track caret movements when movement keys are used', function() {
    var text;
    beforeEach(function() {
      text = '123456789';
      el.sendKeys(text);
    });

    it('should move caret to the start when UP is used', function() {
      el.sendKeys(protractor.Key.UP);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
      });
    });

    it('should move caret to the end when END is used', function() {
      el.sendKeys(protractor.Key.UP);
      el.sendKeys(protractor.Key.END);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length);
      });
    });

    it('should decrement caret when ARROW LEFT is used', function() {
      el.sendKeys(protractor.Key.ARROW_LEFT);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length - 1);
      });
    });

    it('should decrement caret when LEFT is used', function() {
      el.sendKeys(protractor.Key.LEFT);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length - 1);
      });
    });

    it('should decrement caret when ARROW RIGHT is used', function() {
      el.sendKeys(protractor.Key.ARROW_LEFT);
      el.sendKeys(protractor.Key.ARROW_RIGHT);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length);
      });
    });

    it('should decrement caret when RIGHT is used', function() {
      el.sendKeys(protractor.Key.LEFT);
      el.sendKeys(protractor.Key.RIGHT);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length);
      });
    });

    it('should stop caret when at maximum right position', function() {
      el.sendKeys(protractor.Key.END);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length);
        el.sendKeys(protractor.Key.END);
        el.evaluate(attrVal).then(function(pos) {
          expect(pos).toEqual(text.length);
        });
      });
    });

    it('should stop caret when at minimum left position', function() {
      el.sendKeys(protractor.Key.UP);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
        el.sendKeys(protractor.Key.UP);
        el.evaluate(attrVal).then(function(pos) {
          expect(pos).toEqual(0);
        });
      });
    });
  });

  describe('should track caret movements when input changes', function() {
    var text;
    beforeEach(function() {
      text = '123456789';
      el.sendKeys(text);
    });

    it('should move caret forward when text is inserted', function() {
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length);
      });
    });

    it('should move caret backward when text is deleted with backspace', function() {
      var numToCancel = 2,
          i = numToCancel;
      while (i-- > 0) {
        el.sendKeys(protractor.Key.BACK_SPACE);
      }
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(text.length - numToCancel);
      });
    });

    it('should keep the caret fixed when text is deleted with canc', function() {
      el.sendKeys(protractor.Key.UP);
      el.sendKeys(protractor.Key.DELETE);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
      });
    });

    it('should move caret forwar when text is prepended', function() {
      var pre = 'pre';
      el.sendKeys(protractor.Key.UP);
      el.sendKeys(pre);
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(pre.length);
      });
    });
  });


  // TODO: click in the between and insert text
  // DONE: prepend text
  // DONE: append text
  // DONE: delete text (backspace)
  // DONE: delete text (canc)
  // DONE: UP and END
  // DONE: movement with arrow keys
  // TODO: click in the between and delete text (canc)
  // TODO: selection with mouse
  // TODO: selection with special keys (shift + arrow key, ctrl + A)
  // TODO: selection and click inside the selection
});
