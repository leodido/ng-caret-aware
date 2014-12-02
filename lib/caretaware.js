'use strict';

goog.require('leodido.directive.CaretAwareFactory');

// goog.provide('leodido.directive.CaretAwareModule');

/**
 * Module
 */
angular
  .module('leodido.caretAware', [])
  .directive(leodido.constants.CARETAWARE_DIRECTIVE_NAME, leodido.directive.CaretAwareFactory);
