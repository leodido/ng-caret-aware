'use strict';

describe('caret controller', function() {
  leodido.constants.DEBUG = false;

  beforeEach(module('leodido.caretAware'));

  describe('fallback behaviour', function() {
    var scope, ctrl, element;

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      element = angular.element('<div caret-aware></div>');

      $compile(element)(scope);
      scope.$digest();

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

      scope = element.isolateScope() || element.scope();
    }));

    it('should an invalid target tag do not have the support', function() {
      var target = element[0];
      expect(('setSelectionRange' in target) || ('selectionStart' in target)).toBe(false);
      expect(('createTextRange' in target) || ('selection' in document)).toBe(false);
    });

    // Verify that the features are bogus when a tag with no support is used
    it(
        'should fallback when not supported (due to a invalid target element or because of the browser)',
        function() {
          ctrl.setPosition(1);
          expect(ctrl.getPosition()).toEqual(0);
          ctrl.setPosition(2);
          expect(ctrl.getPosition()).toEqual(0);
        });
  });

  describe('watch behaviour', function() {
    var scope,
        ctrl,
        text = 'text';

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      var element = angular.element('<input caret-aware value="' + text + '"/>');

      element = $compile(element)(scope);

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);
    }));

    it(
        'should watch caret value, compare it with last position stored and eventually set the new position',
        function() {
          spyOn(ctrl, 'getPosition');
          spyOn(ctrl, 'setPosition');

          // Use default caret start value
          scope.$digest();

          expect(ctrl.getPosition).toHaveBeenCalled();
          expect(ctrl.setPosition).toHaveBeenCalledWith(0);

          // Manually set a new caret positin via scope
          scope[leodido.constants.CARETAWARE_DEFAULT_NS] = text.length - 1;
          scope.$digest();

          expect(ctrl.getPosition).toHaveBeenCalled();
          expect(ctrl.setPosition).toHaveBeenCalledWith(text.length - 1);
        }
    );

    it('should handle concurrent changes to the caret position (DOM and variable)', function() {
      var val = 1,
          setPositionImpl = ctrl.setPosition,
          spy = spyOn(ctrl, 'setPosition').and.callThrough();
      // Start caret position variable to 4 (default value is 0)
      scope[leodido.constants.CARETAWARE_DEFAULT_NS] = text.length;
      // Start digest
      scope.$digest();

      expect(ctrl.setPosition).toHaveBeenCalledWith(text.length);

      // Simulate a change (e.g., caused by an external event) to the DOM caret position AND caret position variable
      scope.$apply(function() {
        setPositionImpl(val);

        expect(ctrl.getPosition()).toEqual(scope[leodido.constants.CARETAWARE_DEFAULT_NS]);
        expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toEqual(val);
      });
      // A new digest cycle start:
      // caret position variable (i.e. $scope.caret) and DOM caret position (retrieved via getPosition) are equal
      // we don't want setPosition to be called again
      expect(spy.calls.count()).toEqual(1);
      spy.calls.reset();
      expect(ctrl.setPosition).not.toHaveBeenCalled();
    });
  });

  describe('focus', function() {
    xit('should focus target element', function() {
      // TODO
    });
  });

  describe('interface', function() {
    var scope,
        ctrl,
        text = 'text';

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      var element = angular.element('<input caret-aware value="' + text + '"/>');

      $compile(element)(scope);
      scope.$digest();

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

      scope = element.isolateScope() || element.scope();
    }));

    describe('set/get position', function() {
      it('should reject not numeric values', function() {
        expect(function() { ctrl.setPosition(); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(null); });
        expect(function() { ctrl.setPosition(undefined); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(''); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition('1a'); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition([]); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition({}); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(function() {}); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(NaN); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(Infinity); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(-Infinity); }).toThrowError(TypeError);
        expect(function() { ctrl.setPosition(1 / 0); }).toThrowError(TypeError);
      });

      it('should accept only numeric values and store them as integers', function() {
        expect(function() { ctrl.setPosition(0); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition(0.6); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition('0'); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition('0.6'); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition(1); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition(1.6); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition('1'); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition('1.6'); }).not.toThrowError(TypeError);
        expect(ctrl.getPosition()).toEqual(1);
      });

      it('should be fluent', function() {
        expect(ctrl.setPosition(2)).toEqual(ctrl);
      });

      describe('should enforce boundaries', function() {
        it('should ignore values greater than content length', function() {
          ctrl.setPosition(text.length + 2); // setPosition(6)
          expect(ctrl.getPosition()).toEqual(text.length);
          expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toEqual(text.length);
        });

        it('should consider negative values from right to left', function() {
          var max = text.length; // e.g. 4
          for (var j = -1; j >= - max; j--) {
            ctrl.setPosition(j);
            expect(ctrl.getPosition()).toEqual(max + j); // e.g. 4 + (-1) = 3, ..., 4 + (-4) = 0
            expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toEqual(max + j);
          }
        });
      });
    });

    describe('namespace (directive attribute does not have value)', function() {
      var scope, ctrl;

      beforeEach(inject(function(_$rootScope_, $compile) {
        scope = _$rootScope_.$new();

        var element = angular.element('<input caret-aware/>');

        $compile(element)(scope);
        scope.$digest();

        ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

        scope = element.isolateScope() || element.scope();
      }));

      it('should have default ("' + leodido.constants.CARETAWARE_DEFAULT_NS + '") namespace', function() {
        expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toBeDefined();
        expect(ctrl.getNamespace()).toEqual(leodido.constants.CARETAWARE_DEFAULT_NS);
      });

      it('should "' + leodido.constants.CARETAWARE_DEFAULT_NS + '" namespace be initialised to 0', function() {
        expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(scope[leodido.constants.CARETAWARE_DEFAULT_NS]);
      });
    });

    describe('namespace (directive attribute has value)', function() {
      var scope,
          ctrl,
          name = 'cursor';

      beforeEach(inject(function(_$rootScope_, $compile) {
        scope = _$rootScope_.$new();

        var element = angular.element('<input caret-aware="' + name + '"></input>');

        $compile(element)(scope);
        scope.$digest();

        ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

        scope = element.isolateScope() || element.scope();
      }));

      it('should have namespace "' + name + '"', function() {
        expect(scope[name]).toBeDefined();
        expect(ctrl.getNamespace()).toEqual(name);
      });

      it('should "' + name + '" namespace be initialised to 0', function() {
        expect(scope[name]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(scope[name]);
      });
    });

    describe('selection', function() {
      xit('should ...', function() {
      });
    });

  });
});

// TODO: run the same tests with TEXTAREAs!
// TODO: verify that newlines do not create issues on different platforms
