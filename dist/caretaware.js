/**
 * Copyright (c) 2015, Leo Di Donato <leodidonato@gmail.com>
 * ng-caret-aware.js - AngularJS directive for caret aware elements
 * @version v0.1.3
 * @link http://github.com/leodido/ng-caret-aware
 * @license MIT
 */
(function () {
  'use strict';
  var leodido = {
    constants: {}
  };
  leodido.constants.DEBUG = !0;
  leodido.constants.CARETAWARE_DIRECTIVE_NAME = 'caretAware';
  leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME = 'caret';
  leodido.directive = {};
  leodido.directive.CaretAware = function () {};
  leodido.directive.CaretAware.prototype.controller = function (c, e, f) {
    var b = e[0],
      a, d = this;
    d.getNamespace = function () {
      return a;
    };
    d.setPosition = function (a) {
      if (b.createTextRange) {
        var g = b.createTextRange();
        g.move('character', a);
        g.select();
      } else {
        angular.isDefined(b.selectionStart) && b.setSelectionRange(a, a);
      }
      c[d.getNamespace()] = a;
    };
    d.getPosition = function () {
      if ('selectionStart' in b) {
        return b.selectionStart;
      }
      if (document.selection) {
        var a = document.selection.createRange(),
          c = document.selection.createRange().text.length;
        a.moveStart('character', -b.value.length);
        return a.text.length - c;
      }
    };
    a = f[leodido.constants.CARETAWARE_DIRECTIVE_NAME] || leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME;
    c[a] = 0;
  };
  leodido.directive.CaretAware.prototype.controller.$inject = ['$scope', '$element', '$attrs'];
  leodido.directive.CaretAware.prototype.link = function (c, e, f, b) {
    e.bind('keydown keyup click', function () {
      c.$apply(function () {
        c[b.getNamespace()] = b.getPosition();
      });
    });
    c.$watch(function () {
      return c[b.getNamespace()];
    }, function (a) {
      a = ~~a;
      b.getPosition() !== a && b.setPosition(~~a);
    });
  };
  leodido.directive.CaretAwareFactory = function () {
    var c = new leodido.directive.CaretAware;
    return {
      restrict: 'A',
      require: leodido.constants.CARETAWARE_DIRECTIVE_NAME,
      controller: c.controller,
      link: c.link
    };
  };
  angular.module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME, []).directive(leodido.constants.CARETAWARE_DIRECTIVE_NAME,
    leodido.directive.CaretAwareFactory);
})();
