'use strict';

/* global browser, element, expect */

var params = browser.params.scenarios;
// Iterate through available test parameters
for (var p in params) {
  if (params.hasOwnProperty(p)) {
    var param = params[p];

    // IIFE needed because the async nature of e2e protractor tests
    (function(param) {
      // E2E tests // START
      describe('caret aware ' + param.type, function() {
        var el,
            attrVal = 'cursor',
            UP_KEY = param.type === 'input' ? protractor.Key.UP : protractor.Key.PAGE_UP,
            DOWN_KEY = param.type === 'input' ? protractor.Key.DOWN : protractor.Key.PAGE_DOWN;

        beforeEach(function() {
          browser.get(param.page);
          el = element(by.id(param.id));
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

        describe('should track caret position when movement keys are used', function() {
          var text;
          beforeEach(function() {
            text = param.text;
            el.sendKeys(text);
          });

          it('should move caret to the start when UP KEY is used', function() {
            el.sendKeys(UP_KEY);
            browser.sleep(1300);
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(0);
            });
          });

          it('should move caret to the end when DOWN KEY is used', function() {
            el.sendKeys(UP_KEY);
            el.sendKeys(DOWN_KEY);
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
            el.sendKeys(DOWN_KEY);
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(text.length);
              el.sendKeys(DOWN_KEY);
              el.evaluate(attrVal).then(function(pos) {
                expect(pos).toEqual(text.length);
              });
            });
          });

          it('should stop caret when at minimum left position', function() {
            el.sendKeys(UP_KEY);
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(0);
              el.sendKeys(UP_KEY);
              el.evaluate(attrVal).then(function(pos) {
                expect(pos).toEqual(0);
              });
            });
          });
        });

        describe('should track caret position when input changes', function() {
          var text;
          beforeEach(function() {
            text = param.text;
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
            el.sendKeys(UP_KEY);
            el.sendKeys(protractor.Key.DELETE);
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(0);
            });
          });

          it('should move caret forwar when text is prepended', function() {
            var pre = 'pre';
            el.sendKeys(UP_KEY);
            el.sendKeys(pre);
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(pre.length);
            });
          });
        });

        describe('should track caret positions when the text of the element is selected', function() {
          var text,
            selectionBtn,
            selectionRes;
          beforeEach(function() {
            selectionBtn = element(by.buttonText('print selection'));
            selectionRes = element(by.id('selection'));
            text = param.text;
            el.sendKeys(text);
          });

          it('should correctly retrieve selection info when text is selected through SHIFT + ARROW LEFT', function() {
            var arrows = 4,
              resultingStart = text.length - arrows;
            // Cursor is at the end, select RTL: KEYDOWN W/ SHIFT + ARROW_LEFT(s) + KEYUP W/ SHIFT
            browser
              .actions()
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
            el.sendKeys(UP_KEY);
            // Cursor is at the 0, select LTR: KEYDOWN W/ SHIFT + ARROW_RIGHT(s) + KEYUP W/ SHIFT
            browser
              .actions()
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
            var wantedPos = 1;
            var factor = param.type === 'input' ? 7.5 : 10;
            browser
              .actions()
              .keyDown(protractor.Key.SHIFT)
              .sendKeys(Array(text.length + 1).join(protractor.Key.ARROW_LEFT))
              .keyUp(protractor.Key.SHIFT)
              .perform();
            //
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(0);
              // Now click at (factor * wantedPos , 15) pixels offset from top left (i.e., aproximately after third character)
              browser
                .actions()
                .mouseMove(el, { x: factor * wantedPos, y: 15 })
                .click()
                .perform();
              // Verify
              el.evaluate(attrVal).then(function(pos) {
                expect(pos).toEqual(wantedPos);
              });
              browser.actions().click(selectionBtn).perform();
              selectionRes.getText().then(function(content) {
                expect(JSON.parse(content)).toEqual({
                  start: wantedPos,
                  end: wantedPos,
                  length: 0,
                  text: ''
                });
              });
            });
          });
        });

        describe('should track caret position when element is clicked', function() {
          var text,
            factor = param.type === 'input' ? 7.5 : 10;
          beforeEach(function() {
            text = param.text;
            el.sendKeys(text);
          });

          it('should work when element is clicked at the start', function() {
            var startPos = 0;
            browser
              .actions()
              .mouseMove(el, { x: factor * startPos, y: 15})
              .click()
              .perform();
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(0);
            });
          });

          it('should work when element is clicked at the end', function() {
            var endPos = text.length;
            var nlines = text.split(/\n/).length;
            var y = nlines > 0 ? nlines * 15 : 15;
            browser
              .actions()
              .mouseMove(el, { x: factor * endPos, y: y})
              .click()
              .perform();
            el.evaluate(attrVal).then(function(pos) {
              expect(pos).toEqual(endPos);
            });
          });
        });
      });
      // E2E tests // END
    })(param);

  }
}


