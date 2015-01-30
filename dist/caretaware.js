/**
 * Copyright (c) 2015, Leo Di Donato <leodidonato@gmail.com>
 * ng-caret-aware.js - AngularJS directive for caret aware elements
 * @version v0.1.1
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
  leodido.directive.CaretAware.prototype.controller = function (a, f, h, c) {
    var b = f[0],
      g, d = this;
    d.getNamespace = function () {
      return g;
    };
    d.setPosition = function (e) {
      if (b.createTextRange) {
        var k = b.createTextRange();
        k.move('character', e);
        k.select();
      } else {
        c(function () {
          b.focus();
        }, 0, !1), angular.isDefined(b.selectionStart) && b.setSelectionRange(e, e);
      }
      a[d.getNamespace()] = e;
    };
    d.getPosition = function () {
      if ('selectionStart' in b) {
        return b.selectionStart;
      }
      if (document.selection) {
        b.focus();
        var a = document.selection.createRange(),
          c = document.selection.createRange().text.length;
        a.moveStart('character', -b.value.length);
        return a.text.length - c;
      }
    };
    g = h[leodido.constants.CARETAWARE_DIRECTIVE_NAME] || leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME;
    a[g] = 0;
  };
  leodido.directive.CaretAware.prototype.controller.$inject = ['$scope', '$element', '$attrs', '$timeout'];
  leodido.directive.CaretAware.prototype.link = function (a, f, h, c) {
    f.bind('keydown keyup click', function () {
      a.$apply(function () {
        a[c.getNamespace()] = c.getPosition();
      });
    });
    a.$watch(function () {
      return a[c.getNamespace()];
    }, function (a) {
      c.setPosition(~~a);
    });
  };
  leodido.directive.CaretAwareFactory = function () {
    var a = new leodido.directive.CaretAware;
    return {
      restrict: 'A',
      controller: a.controller,
      link: a.link
    };
  };
  angular.module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME, []).directive(leodido.constants.CARETAWARE_DIRECTIVE_NAME,
    leodido.directive.CaretAwareFactory);
})();
