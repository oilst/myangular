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

    it('can make an immediately resolved promise', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var promise = $q.when('ok');
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith('ok');
        expect(rejectedSpy).not.toHaveBeenCalled();
    });

    it('can wrap a foreign promise', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var promise = $q.when({
            then: function (handler) {
                $rootScope.$evalAsync(function () {
                    handler('ok');
                });
            }
        });
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith('ok');
        expect(rejectedSpy).not.toHaveBeenCalled();
    });

    it('can make an immediately rejected promise', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var promise = $q.reject('fail');
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

});


