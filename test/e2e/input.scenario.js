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

  describe('should track caret movements when the text of the element is selected', function() {
    var text,
        selectionBtn,
        selectionRes;
    beforeEach(function() {
      selectionBtn = element(by.buttonText('print selection'));
      selectionRes = element(by.id('selection'));
      text = '123456789';
      el.sendKeys(text);
    });

    it('should correctly retrieve selection info when text is selected through SHIFT + ARROW LEFT', function() {
      var arrows = 4,
          resultingStart = text.length - arrows;
      // Cursor is at the end, select RTL: KEYDOWN W/ SHIFT + ARROW_LEFT(s) + KEYUP W/ SHIFT
      browser.actions()
          .keyDown(protractor.Key.SHIFT)
          .sendKeys(Array(arrows + 1).join(protractor.Key.ARROW_LEFT))
          .keyUp(protractor.Key.SHIFT)
          .perform();
      // Check resulting start pos
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(resultingStart);
      });
      // Check selection info
      browser.actions().click(selectionBtn).perform();
      selectionRes.getText().then(function(content) {
        expect(JSON.parse(content)).toEqual({
          start: resultingStart,
          end: text.length,
          length: arrows,
          text: text.substr(resultingStart, arrows)
        });
      });
    });

    it('should correctly retrieve selection info when text is selected through SHIFT + ARROW RIGHT', function() {
      var arrows = 4,
          resultingEnd = arrows;
      el.sendKeys(protractor.Key.UP);
      // Cursor is at the 0, select LTR: KEYDOWN W/ SHIFT + ARROW_RIGHT(s) + KEYUP W/ SHIFT
      browser.actions()
          .keyDown(protractor.Key.SHIFT)
          .sendKeys(Array(arrows + 1).join(protractor.Key.ARROW_RIGHT))
          .keyUp(protractor.Key.SHIFT)
          .perform();
      // Check start pos
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
      });
      // Check selection info
      browser.actions().click(selectionBtn).perform();
      selectionRes.getText().then(function(content) {
        expect(JSON.parse(content)).toEqual({
          start: 0,
          end: resultingEnd,
          length: arrows,
          text: text.substr(0, resultingEnd)
        });
      });
    });

    it('should correctly handle CTRL + A', function() {
      el.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
      });
      // Check selection info
      browser.actions().click(selectionBtn).perform();
      selectionRes.getText().then(function(content) {
        expect(JSON.parse(content)).toEqual({
          start: 0,
          end: text.length,
          length: text.length,
          text: text
        });
      });
    });

    it('should allow to click when content is selected and update caret position', function() {
      browser.actions()
          .keyDown(protractor.Key.SHIFT)
          .sendKeys(Array(text.length + 1).join(protractor.Key.ARROW_LEFT))
          .keyUp(protractor.Key.SHIFT)
          .perform();
      //
      el.evaluate(attrVal).then(function(pos) {
        expect(pos).toEqual(0);
        // Now click at (25,15) pixels offset from top left (i.e., aproximately after third character)
        browser.actions()
            .mouseMove(el, {x: 25, y: 15})
            .click()
            .perform();
        // Verify
        el.evaluate(attrVal).then(function(pos) {
          expect(pos).toEqual(3);
        });
        browser.actions().click(selectionBtn).perform();
        selectionRes.getText().then(function(content) {
          expect(JSON.parse(content)).toEqual({
            start: 3,
            end: 3,
            length: 0,
            text: ''
          });
        });
      });
    });
  });

  // DONE: prepend text
  // DONE: append text
  // DONE: delete text (backspace)
  // DONE: delete text (canc)
  // DONE: UP and END
  // DONE: movement with arrow keys

  // DONE: selection with special keys (shift + arrow keys)
  // DONE: selection with ctrl + A
  // DONE: selection and click inside the selection

  // TODO: click at the end
  // TODO: click at the start
  // TODO: click in the between and insert text
  // TODO: click in the between and delete text (backspace)
  // TODO: click in the between and delete text (canc)
});
