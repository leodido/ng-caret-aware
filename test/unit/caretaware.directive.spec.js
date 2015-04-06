'use strict';

describe('caret aware directive', function() {
  leodido.constants.DEBUG = false;

  beforeEach(module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME));

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
        setPositionImpl(val); // Use the original implementation, not the spied one

        // Also the caret variable (i.e., scope[leodido.constants.CARETAWARE_DEFAULT_NS]) has changed
        // Test that the caret variable and the DOM caret position contains the same value
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

  describe('events behaviour', function() {
    var scope,
        element,
        ctrl,
        text = 'text',
        spyEvalAsync,
        spyGetPos;

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      element = $compile(angular.element('<input caret-aware value="' + text + '"/>'))(scope);
      spyEvalAsync = spyOn(scope, '$evalAsync').and.callThrough();

      ctrl = element.controller(leodido.constants.CARETAWARE_DIRECTIVE_NAME);
      spyGetPos = spyOn(ctrl, 'getPosition').and.callThrough();
    }));

    it('should catch keydown', function() {
      expect(scope.touched).toBeFalsy();
      element.triggerHandler('keydown');
      expect(spyEvalAsync).toHaveBeenCalled();
      scope.$digest();
      expect(spyGetPos).toHaveBeenCalled();
    });

    it('should catch keyup', function() {
      expect(scope.touched).toBeFalsy();
      element.triggerHandler('keyup');
      expect(spyEvalAsync).toHaveBeenCalled();
      scope.$digest();
      expect(spyGetPos).toHaveBeenCalled();
    });

    it('should catch click', function() {
      expect(scope.touched).toBeFalsy();
      element.triggerHandler('click');
      expect(spyEvalAsync).toHaveBeenCalled();
      scope.$digest();
      expect(spyGetPos).toHaveBeenCalled();
    });

    it('should asynchronously evaluate the DOM caret position assigning it to the caret variable', function() {
      expect(scope.touched).toBeFalsy();

      ctrl.setPosition(text.length);
      element.triggerHandler('keydown');
      // if we are not in a $digest cycle and no $digest has previously been scheduled $evalAsync schedules a $digest
      expect(spyEvalAsync).toHaveBeenCalled();
      scope.$digest();
      expect(spyGetPos).toHaveBeenCalled();
      expect(spyGetPos()).toEqual(text.length);
      expect(scope[leodido.constants.CARETAWARE_DEFAULT_NS]).toEqual(4);
    });
  });

  describe('destroy', function() {
    var scope,
        elem,
        spyOff,
        text = 'text',
        varname = 'cursor';

    beforeEach(inject(function(_$rootScope_, $compile) {
      scope = _$rootScope_.$new();

      elem = $compile('<input caret-aware="' + varname + '" value="' + text + '"/>')(scope);
      spyOff = spyOn(angular.element.prototype, 'off');

      scope.$digest();
    }));

    it('should delete caret variable and unbind DOM events', function() {
      scope.$destroy();
      expect(scope.$$destroyed).toBe(true);
      expect(scope[varname]).toBeUndefined();
      expect(spyOff).toHaveBeenCalledWith('keydown keyup click');
    });
  });
});
