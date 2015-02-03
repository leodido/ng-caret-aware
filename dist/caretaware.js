/**
 * Copyright (c) 2015, Leo Di Donato <leodidonato@gmail.com>
 * ng-caret-aware.js - AngularJS directive for caret aware elements
 * @version v0.1.2
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
  leodido.directive.CaretAware.prototype.controller = function (a, f, g) {
    var b = f[0],
      c, d = this;
    d.getNamespace = function () {
      return c;
    };
    d.setPosition = function (e) {
      if (b.createTextRange) {
        var c = b.createTextRange();
        c.move('character', e);
        c.select();
      } else {
        angular.isDefined(b.selectionStart) && b.setSelectionRange(e, e);
      }
      a[d.getNamespace()] = e;
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
    c = g[leodido.constants.CARETAWARE_DIRECTIVE_NAME] || leodido.constants.CARETWARE_DEFAULT_CARET_VARNAME;
    a[c] = 0;
  };
  leodido.directive.CaretAware.prototype.controller.$inject = ['$scope', '$element', '$attrs'];
  leodido.directive.CaretAware.prototype.link = function (a, f, g, b) {
    f.bind('keydown keyup click', function () {
      a.$apply(function () {
        a[b.getNamespace()] = b.getPosition();
      });
    });
    a.$watch(function () {
      return a[b.getNamespace()];
    }, function (a) {
      b.setPosition(~~a);
    });
  };
  leodido.directive.CaretAwareFactory = function () {
    var a = new leodido.directive.CaretAware;
    return {
      restrict: 'A',
      require: leodido.constants.CARETAWARE_DIRECTIVE_NAME,
      controller: a.controller,
      link: a.link
    };
  };
  angular.module('leodido.' + leodido.constants.CARETAWARE_DIRECTIVE_NAME, []).directive(leodido.constants.CARETAWARE_DIRECTIVE_NAME,
    leodido.directive.CaretAwareFactory);
})();
