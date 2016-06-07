/* jshint globalstrict: true */
/* global publishExternalAPI: false, createInjector: false */

'use strict';

describe("$q CTT", function () {
    var $q, $rootScope;
    beforeEach(function () {
        publishExternalAPI();
        var injector = createInjector(['ng']);
        $q = injector.get('$q');
        $rootScope = injector.get('$rootScope');
    });


    it('Challenge', function () {
        var d = $q.defer();
        var result = 0;
        var resolveNested;

        d.promise
            .catch(
                function (value) {
                    return (value + 1);
                }
            )
            .then(
                function (value) {
                    return $q.reject(value * 2);

                },
                function (value) {
                    return value * 3;
                }
            )
            .finally(
                function (value) {
                    result = value;
                    var d2 = $q.defer();
                    resolveNested = function () {
                        d2.resolve(7);
                    };
                    return d2.promise;
                }
            )
            .then(
                function (value) {
                    result = value + 1;
                },
                function (value) {
                    result = value + 2;
                }
            );

        d.reject(1);
        $rootScope.$apply();
        expect(result).toBe('???');

        resolveNested();
        $rootScope.$apply();
        expect(result).toBe('???');
    });


});


