Caret aware inputs
==================

[![Bower](https://img.shields.io/bower/v/ng-caret-aware.svg?style=flat-square)](http://bower.io/search/?q=ng-caret-aware)

**AngularJS directive for caret aware elements**.

Put it on your HTML input elements and it will **track the caret** (i.e. cursor) exporting its **position** in a variable (named after the value assigned to the directive attribute) appended to the parent `$scope`.

Weight: ~1.5KB.

#### Note

At the moment this directive can be used only as attribute.

Usage
-----

Include AngularJS, and the build (e.g., `caretaware.min.js`).
 
Then insert `leodido.caretAware` AngularJS module in your module's dependencies (e.g., `var app = angular.module('myAwesomeModule', ['leodido.caretAware']);`).

```html
<input type="text" name="myCursorField" caret-aware="cursor"/>
```

Parent scope will contain a `cursor` variable tracking the caret position of input named `myCursorField`.

Or, simply:

```html
<input type="text" name="myCaretField" caret-aware/>
```

Parent scope will contain a `caret` (the default name) variable tracking the caret position of input named `myCaretField`.

#### Note

See [example](/example) directory for further details.

Install
-------

Install it via `bower`.

```
bower install ng-caret-aware
```

Or, you can clone this repo and install it locally (you will need `npm`, of course).

```
$ git clone git@github.com:leodido/ng-caret-aware.git
$ cd ng-caret-aware/
$ npm install
```

Distribution
------------

In the root directory you can find both development and production ready library:

1. `dev.caretaware.min.js` and its sourcemap (i.e., `dev.caretaware.min.js.map` file) can be used for development purposes

2. `caretaware.min.js` is the production version of this AngularJS module

Build
-----

Build is handled through [Gulp](https://github.com/gulpjs/gulp/) and performed mainly via [Google Closure Compiler](https://github.com/google/closure-compiler).

Need help? Run `gulp help` !

```
# Usage
#   gulp [task]
# 
# Available tasks
#   build                                  Build the library 
#    --banner                              Prepend banner to the built file
#    --env=production|development          Kind of build to perform, defaults to production
#  bump                                    Bump version up for a new release 
#   --level=major|minor|patch|prerelease   Version level to increment
#   clean                                  Clean build directory
#   help                                   Display this help text
#   lint                                   Lint JS source files
#   version                                Print the library version
```

Aknowledgements
---------------

* Thanks to [@leogr](http://github.com/leogr) for his suggestions, and improvements. Particularly for his help fixing issue [#14](https://github.com/leodido/ng-caret-aware/issues/14).

* Thanks for the inspiration to all authors of snippets (that are present on the web) related to the caret management.

---

[![Analytics](https://ga-beacon.appspot.com/UA-49657176-1/ng-caret-aware)](https://github.com/igrigorik/ga-beacon)
