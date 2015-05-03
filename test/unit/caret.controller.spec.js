'use strict';


describe('caret controller', function() {
  leodido.constants.DEBUG = false;

  beforeEach(module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME));

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

    it('should an invalid target do not have the support', function() {
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
          expect(ctrl.getSelection()).toEqual({ start: 0, end: 0, length: 0, text: '' });
        });
  });

  describe('browser support', function() {
    var scope, ctrl, element;

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      element = angular.element('<input caret-aware></div>');

      $compile(element)(scope);
      scope.$digest();

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

      scope = element.isolateScope() || element.scope();
    }));

    // Almost one of the two supported ways, otherwise browser is not supported
    it('should a valid target be supported', function() {
      var target = element[0];
      var condition = (('setSelectionRange' in target) || ('selectionStart' in target)) ||
                      (('createTextRange' in target) || ('selection' in document));
      if (!condition) {
        fail('browser not supported.');
        // TODO: fail fast, shutdown test suite
      }
    });
  });

  // TODO: study focus questions
  describe('focus', function() {
    var scope,
        element,
        ctrl,
        text = 'text';

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      element = $compile(angular.element('<input caret-aware value="' + text + '"/>'))(scope);
      angular.element(document.body).append(element);

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);

      jasmine.addMatchers({
        toHaveFocus: function() {
          return {
            compare: function(actual) {
              return {
                pass: document.activeElement === actual[0]
              };
            }
          };
        }
      });
    }));

    it('should focus target element', function() {
      ctrl.setPosition(text.length);
      expect(element).toHaveFocus();
    });
  });

  describe('interface', function() {
    var scope,
        ctrl,
        text = 'text',
        varname = leodido.constants.CARETAWARE_DEFAULT_NS;

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
        // NOTE
        // getPosition() on Firefox SEEMS to do not work while $scope variable correctly reflects setPosition() changes
        // but this SEEMS to happens only in test cases

        expect(function() { ctrl.setPosition(0); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition(0.6); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition('0'); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition('0.6'); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(0);
        expect(ctrl.getPosition()).toEqual(0);
        expect(function() { ctrl.setPosition(1); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(1);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition(1.6); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(1);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition('1'); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(1);
        expect(ctrl.getPosition()).toEqual(1);
        expect(function() { ctrl.setPosition('1.6'); }).not.toThrowError(TypeError);
        expect(scope[varname]).toEqual(1);
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

    var name = 'cursor';
    describe('namespace (directive attribute has value "' + name + '")', function() {
      var scope,
          ctrl;

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
      var scope,
          ctrl,
          text = 'text';

      beforeEach(inject(function(_$rootScope_, $compile) {
        scope = _$rootScope_.$new();

        var element = $compile(angular.element('<input caret-aware value="' + text + '"/>'))(scope);

        ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);
      }));

      it('should retrieve selection info even when no only start position is set', function() {
        var val = 2;
        ctrl.setPosition(val);
        expect(ctrl.getSelection()).toEqual({start: val, end: val, text: '', length: 0});
      });
    });

  });
});
