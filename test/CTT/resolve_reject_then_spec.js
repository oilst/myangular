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

    it('can resolve a promise', function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(41);
        $rootScope.$apply();
        expect(promiseSpy).toHaveBeenCalledWith(41);
    });

    it('does not resolve promise immediately (Sequentiality)', function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(42);
        expect(promiseSpy).not.toHaveBeenCalled();
    });

    it('may only be resolved once', function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(42);
        d.resolve(43);
        $rootScope.$apply();
        expect(promiseSpy.calls.count()).toEqual(1);
        expect(promiseSpy).toHaveBeenCalledWith(42);
    });

    it('can reject a deferred', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy, rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(fulfillSpy).not.toHaveBeenCalled();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });

    it('promises can be chained', function () {
        var d = $q.defer();
        var result = 0;
        d.promise.then(
            function (value) {
                return value + 1;
            }
        ).then (
            function (value) {
                result = value + 1;
            }
        );
        d.resolve(1);
        $rootScope.$apply();
        expect(result).toBe(3);
    });

    it('the failure handler returns a resolved promise', function () {
        var d = $q.defer();
        var result = 0;
        d.promise.then(
            null
            ,
            function () {
                return 4;
            }
        ).then (
            function (value) {
                result = value;
            },
            function (value) {
                result = value + 1;
            }
        );
        d.reject('fail');
        $rootScope.$apply();
        expect(result).toBe(4);
    });

    it('waits on promise returned from handler', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(function (v) {
            var d2 = $q.defer();
            d2.resolve(v + 1);
            return d2.promise;
        }).then(function (v) {
            return v * 2;
        }).then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });

    // Tricky!!
    it('waits on promise given to resolve', function () {
        var d = $q.defer();
        var d2 = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(fulfilledSpy);
        d2.resolve(42);
        d.resolve(d2.promise);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });

    it('Does not wait on promise given to reject', function () {
        var d = $q.defer();
        var d2 = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(null,fulfilledSpy);
        d2.resolve(42);
        d.reject(d2.promise);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(d2.promise);
    });

});


