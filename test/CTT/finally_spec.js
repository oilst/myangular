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

    it('allows chaining handlers on finally, with original value', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(function (result) {
            return result + 1;
        }).finally(function (result) {
            return result * 2;
        }).then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(21);
    });

    it('allows chaining handlers on finally, with original rejection', function () {
        var d = $q.defer();
        var rejectedSpy = jasmine.createSpy();
        d.promise.then(function (result) {
            throw 'fail';
        }).finally(_.noop).catch(rejectedSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

    // This is important!!
    it('resolves to orig value when nested promise resolves', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        var resolveNested;
        d.promise.then(function (result) {
            return result + 1;
        }).finally(function (result) {
            var d2 = $q.defer();
            resolveNested = function () {
                d2.resolve('abc');
            };
            return d2.promise;
        }).then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        resolveNested();
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(21);
    });

    it('rejects to original value when nested promise resolves', function () {
        var d = $q.defer();
        var rejectedSpy = jasmine.createSpy();
        var resolveNested;
        d.promise.then(function (result) {
            throw 'fail';
        }).finally(function (result) {
            var d2 = $q.defer();
            resolveNested = function () {
                d2.resolve('abc');
            };
            return d2.promise;
        }).catch(rejectedSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(rejectedSpy).not.toHaveBeenCalled();
        resolveNested();
        $rootScope.$apply();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

    it('rejects when nested promise rejects in finally', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var rejectNested;
        d.promise.then(function (result) {
            return result + 1;
        }).finally(function (result) {
            var d2 = $q.defer();
            rejectNested = function () {
                d2.reject('fail');
            };
            return d2.promise;
        }).then(fulfilledSpy, rejectedSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        rejectNested();
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

});


