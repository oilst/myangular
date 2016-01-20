/* jshint globalstrict: true */
'use strict';
function setupModuleLoader(window) {

    var ensure = function (obj, name, factory) {
        return obj[name] || (obj[name] = factory());
    };

    var angular = ensure(window, 'angular', Object);

    var createModule = function (name, requires, modules) {
        var moduleInstance = {
            name: name,
            requires: requires
        };
        modules[name] = moduleInstance;
        return moduleInstance;
    };


    ensure(angular, 'module', function () {
        var modules = {};
        return function (name, requires) {
            if (requires) {
                return createModule(name, requires, modules);
            } else {
                return getModule(name, modules);
            }
        };
    });

    var getModule = function (name, modules) {
        return modules[name];
    };
}