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
        expect(result).toBe(undefined);

        resolveNested();
        $rootScope.$apply();
        expect(result).toBe(6);
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


    it('catches does the same as then', function () {
        var d = $q.defer();
        var result = 0;
        d.promise.catch(
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





    it('fulfills on chained handler', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.catch(_.noop).then(fulfilledSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });


    it('treats catch return value as resolution', function () {
        var d = $q.defer();
        var resolvedSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        d.promise
            .catch(function () {
                return 42;
            })
            .then(resolvedSpy, rejectedSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(resolvedSpy).toHaveBeenCalledWith(42);
//        expect(rejectedSpy).toHaveBeenCalledWith(42);    //interesting case
    });

    it('rejects chained promise when handler throws', function () {
        var d = $q.defer();
        var rejectedSpy = jasmine.createSpy();
        d.promise.then(function () {
            throw 'fail';
        }).catch(rejectedSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });


    // another interesting case!
    it('does not reject current promise when handler throws', function () {
        var d = $q.defer();
        var rejectedSpy = jasmine.createSpy();
        d.promise.then(function () {
            throw 'fail';
        });
        d.promise.catch(rejectedSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(rejectedSpy).not.toHaveBeenCalled();
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

    it('rejects when promise returned from handler rejects', function () {
        var d = $q.defer();
        var rejectedSpy = jasmine.createSpy();
        d.promise.then(function () {
            var d2 = $q.defer();
            d2.reject('fail');
            return d2.promise;
        }).catch(rejectedSpy);
        d.resolve('ok');
        $rootScope.$apply();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });


    //another interesting case
    it('waits on promise given to reject', function () {
        var d = $q.defer();
        var d2 = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.catch(fulfilledSpy);
        d2.resolve(42);
        d.reject(d2.promise);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(d2.promise);
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
        }).finally(function () {
        }).catch(rejectedSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });

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

    it('can make an immediately rejected promise', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var promise = $q.reject('fail');
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        expect(rejectedSpy).toHaveBeenCalledWith('fail');
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

    it('takes callbacks directly when wrapping', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var wrapped = $q.defer();
        $q.when(
            wrapped.promise,
            fulfilledSpy,
            rejectedSpy
        );
        wrapped.resolve('ok');
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith('ok');
        expect(rejectedSpy).not.toHaveBeenCalled();
    });

    it('makes an immediately resolved promise with resolve', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var promise = $q.resolve('ok');
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith('ok');
        expect(rejectedSpy).not.toHaveBeenCalled();
    });

});


