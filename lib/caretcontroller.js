'use strict';

goog.provide('leodido.controller.Caret');

goog.require('leodido.constants');



/**
 * Caret controller
 *
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $element
 * @param {!angular.Attributes} $attrs
 * @constructor
 * @ngInject
 */
leodido.controller.Caret = function($scope, $element, $attrs) {
  leodido.constants.DEBUG && console.log('CaretController::ctor');
  // Privates
  /** @type {HTMLInputElement|HTMLTextAreaElement} */
  var target = $element[0];
  /**
   * @type {!string}
   */
  var namespace;
  /**
   * Set namespace of directive instance and its init value on the scope
   *
   * @param {!string} ns
   * @return {!leodido.controller.Caret}
   */
  var setNamespace = function(ns) {
    namespace = ns || leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME;
    $scope[namespace] = 0;
    return ctrl;
  };
  /**
   * @type {{selectionRange: !boolean, textRange: !boolean}}
   */
  var support = {
    selectionRange: ('setSelectionRange' in target) || ('selectionStart' in target),
    textRange: ('createTextRange' in target) || ('selection' in document)
  };
  var carriageReturn = /\r/g; // TODO: what to do with \n rather?
  /**
   * Get the textual value of the caret aware element
   *
   * @return {!angular.JQLite|string}
   */
  var getValue = function() {
    if (typeof target.value !== 'undefined') {
      return target.value;
    }
    return $element.text();
  };
  /**
   * Get a valid position
   *
   * @param {?number} pos
   * @return {!number}
   */
  var getIndex = function(pos) {
    var value = getValue().replace(carriageReturn, ''),
        len = value.length,
        position = ~~pos;
    // Enforce boundaries
    if (position < 0) {
      position = len + pos + 1;
    } else if (position > len) {
      position = len;
    }
    return position;
  };
  // Public API
  var ctrl = this;
  /**
   * @type {!Function}
   */
  var getPositionPolyfill;
  /**
   * @type {!Function}
   */
  var setPositionPolyfill;
  switch (true) {
    case support.selectionRange:
      // HTML5, Chrome, Mozilla, et. al
      getPositionPolyfill = function() {
        return target.selectionStart;
      };
      setPositionPolyfill = function(pos) {
        pos = getIndex(pos);
        target.focus();
        target.setSelectionRange(pos, pos);
        $scope[ctrl.getNamespace()] = pos;
        return ctrl;
      };
      break;
    case support.textRange:
      // IE < 9
      getPositionPolyfill = function() {
        // TODO: verify that works
        target.focus();
        var rng = document.selection.createRange();
        var len = document.selection.createRange().text.length; // caret end position
        rng.moveStart('character', -target.value.length);
        return rng.text.length - len;
      };
      setPositionPolyfill = function(pos) {
        pos = getIndex(pos);
        var range = target.createTextRange();
        range.move('character', pos);
        range.select();
        $scope[ctrl.getNamespace()] = pos;
        return ctrl;
      };
      break;
    default:
      // not supported, unknown
      getPositionPolyfill = function() {
        return 0;
      };
      setPositionPolyfill = function() {
        return ctrl;
      };
  }
  /**
   * Retrieve namespace of directive instance
   *
   * @return {!string}
   * @expose
   */
  ctrl.getNamespace = function() {
    return namespace;
  };
  /**
   * Manually set the caret position
   *
   * @param {!number} pos
   * @return {!leodido.directive.CaretAware}
   * @expose
   */
  ctrl.setPosition = setPositionPolyfill;
  /**
   * Retrieve the (start) caret position
   *
   * @return {!number}
   * @expose
   */
  ctrl.getPosition = getPositionPolyfill;

  // When $scope variable changes set caret to its value
  $scope.$watch(
      function() {
        return $scope[ctrl.getNamespace()];
      },
      function(val) {
        if (ctrl.getPosition() !== val) {
          ctrl.setPosition(val);
        }
      }
  );
  // Set namespace from attribute on startup and instantiate caret position to 0
  setNamespace($attrs[leodido.constants.CARETAWARE_DIRECTIVE_NAME]);
};
