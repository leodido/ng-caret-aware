'use strict';

// goog.require('goog.dom.selection');
goog.require('leodido.constants');
goog.provide('leodido.directive.CaretAwareFactory');

/**
 * A directive that makes the target aware of the caret position
 *
 * @constructor
 */
leodido.directive.CaretAware = function () {};

// * @param {!angular.$timeout} $timeout
/**
 * CaretAware directive controller
 *
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $element
 * @param {!angular.Attributes} $attrs
 * @ngInject
 */
leodido.directive.CaretAware.prototype.controller = function ($scope, $element, $attrs/*, $timeout*/) {
  /** @type {HTMLInputElement|HTMLTextAreaElement} */
  var el = $element[0];
  // Privates
  var namespace;
  /**
   * Set namespace of directive instance and its init value on the scope
   *
   * @param {!String} ns
   */
  var setNamespace = function (ns) {
    namespace = ns || leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME;
    $scope[namespace] = 0;
  };
  // Public API
  var ctrl = this;
  /**
   * Retrieve namespace of directive instance
   *
   * @returns {String}
   */
  ctrl.getNamespace = function () {
    return namespace;
  };
  /**
   * Manually set the caret position
   *
   * @param {!Number} pos
   */
  ctrl.setPosition = function (pos) {
    // goog.dom.selection.setCursorPosition(el, pos);
    if (el.createTextRange) { // IE < 9
      var range = el.createTextRange();
      range.move('character', pos);
      range.select();
    } else {
//      $timeout(function () { el.focus(); }, 0, false); //
      if (angular.isDefined(el.selectionStart)) { // el.selectionStart !== undefined
        el.setSelectionRange(pos, pos);
      }
    }
    $scope[ctrl.getNamespace()] = pos;
  };
  /**
   * Retrieve the caret position
   *
   * @returns {Number}
   */
  ctrl.getPosition = function () {
    // return goog.dom.selection.getStart(el);
    if ('selectionStart' in el) {
      return el.selectionStart;
    } else if (document.selection) { // IE
//      el.focus(); //
      var rng = document.selection.createRange();
      var len = document.selection.createRange().text.length;
      rng.moveStart('character', -el.value.length);
      return rng.text.length - len;
    }
  };
  // Set namespace from attribute on startup and instantiate caret position to 0
  setNamespace($attrs[leodido.constants.CARETAWARE_DIRECTIVE_NAME]);
};

/**
 * CaretAware post-link function
 *
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $elem
 * @param {!angular.Attributes} $attrs
 * @param {!leodido.directive.CaretAware} $ctrl
 */
leodido.directive.CaretAware.prototype.link = function ($scope, $elem, $attrs, $ctrl) {
  // Bind events
  $elem.bind('keydown keyup click', function () {
    $scope.$apply(function () {
      $scope[$ctrl.getNamespace()] = $ctrl.getPosition();
    });
  });
  // When $scope variable changes set caret to its value
  $scope.$watch(
    function () {
      return $scope[$ctrl.getNamespace()];
    },
    function (val) {
      $ctrl.setPosition(~~val);
    }
  );
};

/**
 * CaretAware directive factory
 *
 * @return {angular.Directive} Directive definition object
 */
leodido.directive.CaretAwareFactory = function () {
  /* jshint -W058 */
  var directive = new leodido.directive.CaretAware();
  return {
    restrict: 'A',
    require: leodido.constants.CARETAWARE_DIRECTIVE_NAME,
    controller: directive.controller,
    link: directive.link
  };
};


