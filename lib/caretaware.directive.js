'use strict';

goog.provide('leodido.directive.CaretAwareFactory');

goog.require('leodido.constants');
goog.require('leodido.controller.Caret');



/**
 * A directive that makes the target aware of the caret position
 *
 * @constructor
 */
leodido.directive.CaretAware = function() {
  leodido.constants.DEBUG && console.log('CaretAware::ctor');
};


/**
 * CaretAware post-link function
 *
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $elem
 * @param {!angular.Attributes} $attrs
 * @param {!leodido.controller.Caret} $ctrl
 */
leodido.directive.CaretAware.prototype.link = function($scope, $elem, $attrs, $ctrl) {
  leodido.constants.DEBUG && console.log('CaretAware::link');
  // Bind events
  $elem.on('keydown keyup click', function() {
    // Add the code to the current or next digest cycle
    $scope.$evalAsync(function() {
      $scope[$ctrl.getNamespace()] = $ctrl.getPosition();
    });
  });
  // When $scope variable changes automatically set DOM caret to its value
  $scope.$watch(
      function() {
        return $scope[$ctrl.getNamespace()];
      },
      function(val) {
        if ($ctrl.getPosition() !== val) {
          $ctrl.setPosition(val);
        }
      }
  );
  // Teardown
  $scope.$on('$destroy', function() {
    delete $scope[$ctrl.getNamespace()];
    $elem.off('keydown keyup click');
  });
};


/**
 * CaretAware directive factory
 *
 * @return {!angular.Directive} Directive definition object
 */
leodido.directive.CaretAwareFactory = function() {
  var directive = new leodido.directive.CaretAware();
  return {
    restrict: 'AC',
    require: leodido.constants.CARETAWARE_DIRECTIVE_NAME,
    controller: leodido.controller.Caret,
    link: directive.link
  };
};
