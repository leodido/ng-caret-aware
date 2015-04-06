'use strict';


/**
 * Accept a list of module names and attempts to load them in order
 *
 * @param {*} names
 * @return {*}
 */
var tryModules = function(names) {
  // throw an error if no options available
  if (names.length === 0) {
    throw new Error('None of the modules could be loaded.');
  }

  // Attempt to load the module into m
  var m;
  try {
    m = angular.module(names[0]);
  } catch (err) {
    m = null;
  }

  return (m == null ? tryModules(names.slice(1)) : m);
};


describe('module', function() {
  leodido.constants.DEBUG = false;
  var m;

  it('should have been registered', function() {
    expect(m = tryModules(['leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME])).toEqual(jasmine.any(Object));
  });

  it('should be called "leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME + '"', function() {
    expect(m.name).toEqual('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME);
  });

  it('should contain the directive "' + leodido.constants.CARETAWARE_DIRECTIVE_NAME + '"', function() {
    var res = {};
    angular.forEach(m._invokeQueue, function(a) {
      if (res[a[1]] !== undefined) {
        res[a[1]].push(a[2][0]);
      } else {
        res[a[1]] = [a[2][0]];
      }
    });

    expect(res).toEqual(jasmine.objectContaining({
      directive: [leodido.constants.CARETAWARE_DIRECTIVE_NAME]
    }));
  });
});
