'use strict';

goog.require('leodido.directive.CaretAwareFactory');


/**
 * AngularJS module containing the directive
 */
angular
    .module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME, [])
    .directive(leodido.constants.CARETAWARE_DIRECTIVE_NAME, leodido.directive.CaretAwareFactory);
