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

    it('can resolve an array of promises to array of results', function () {
        var promise = $q.all([$q.when(1), $q.when(2), $q.when(3)]);
        var fulfilledSpy = jasmine.createSpy();
        promise.then(fulfilledSpy);

        $rootScope.$apply();

        expect(fulfilledSpy).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('can resolve an object of promises to an object of results', function () {
        var promise = $q.all({a: $q.when(1), b: $q.when(2)});
        var fulfilledSpy = jasmine.createSpy();
        promise.then(fulfilledSpy);

        $rootScope.$apply();

        expect(fulfilledSpy).toHaveBeenCalledWith({a: 1, b: 2});
    });


    it('rejects when any of the promises rejects', function () {
        var promise = $q.all([$q.when(1), $q.when(2), $q.reject('fail')]);
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        promise.then(fulfilledSpy, rejectedSpy);

        $rootScope.$apply();

        expect(fulfilledSpy).not.toHaveBeenCalled();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

    it('wraps non-promises in the input collection', function () {
        var promise = $q.all([$q.when(1), 2, 3]);
        var fulfilledSpy = jasmine.createSpy();
        promise.then(fulfilledSpy);

        $rootScope.$apply();

        expect(fulfilledSpy).toHaveBeenCalledWith([1, 2, 3]);
    });

});


