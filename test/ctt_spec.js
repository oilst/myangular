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

    it('can create a Deferred', function () {
        var d = $q.defer();
        expect(d).toBeDefined();
    });

    it('has a promise for each Deferred', function () {
        var d = $q.defer();
        expect(d.promise).toBeDefined();
    });

    it('can resolve a promise', function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(41);
        $rootScope.$apply();
        expect(promiseSpy).toHaveBeenCalledWith(41);
    });

    it('works when resolved before promise listener', function () {
        var d = $q.defer();
        d.resolve(42);
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        $rootScope.$apply();
        expect(promiseSpy).toHaveBeenCalledWith(42);
    });

    it('does not resolve promise immediately', function () {
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

    it('cannot fulfill a promise once rejected', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy, rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        d.resolve('success');
        $rootScope.$apply();
        expect(fulfillSpy).not.toHaveBeenCalled();
    });

    it('does not require a failure handler each time', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy);
        d.promise.then(null, rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });

    it('does not require a success handler each time', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy);
        d.promise.then(null, rejectSpy);
        d.resolve('ok');
        $rootScope.$apply();
        expect(fulfillSpy).toHaveBeenCalledWith('ok');
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

    it('catches rejected promises', function () {
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
        expect(rejectedSpy).not.toHaveBeenCalledWith();    //interesting case
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

    // Tricky!! you might never use this. But its good to know!
    it('takes callbacks directly when wrapping', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var wrapped = $q.defer();
        $q.when(
            wrapped.promise,
            fulfilledSpy,
            rejectedSpy
        );
        expect(fulfilledSpy).not.toHaveBeenCalledWith('ok');
        wrapped.resolve('ok');
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

    it('reject calls handler immedialtely when value is a promise', function () {
        var fulfilledSpy = jasmine.createSpy();
        var rejectedSpy = jasmine.createSpy();
        var p = $q.defer().promise;
        var promise = $q.reject(p);
        promise.then(fulfilledSpy, rejectedSpy);
        $rootScope.$apply();
        expect(fulfilledSpy).not.toHaveBeenCalled();
        expect(rejectedSpy).toHaveBeenCalledWith(p);
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


    describe('all', function() {

        it('can resolve an array of promises to array of results', function() {
            var promise = $q.all([$q.when(1), $q.when(2), $q.when(3)]);
            var fulfilledSpy = jasmine.createSpy();
            promise.then(fulfilledSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).toHaveBeenCalledWith([1, 2, 3]);
        });

        it('can resolve an object of promises to an object of results', function() {
            var promise = $q.all({a: $q.when(1), b: $q.when(2)});
            var fulfilledSpy = jasmine.createSpy();
            promise.then(fulfilledSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).toHaveBeenCalledWith({a: 1, b: 2});
        });

        it('resolves an empty array immediately', function() {
            var promise = $q.all([]);
            var fulfilledSpy = jasmine.createSpy();
            promise.then(fulfilledSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).toHaveBeenCalledWith([]);
        });

        it('resolves an empty object immediately', function() {
            var promise = $q.all({});
            var fulfilledSpy = jasmine.createSpy();
            promise.then(fulfilledSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).toHaveBeenCalledWith({});
        });

        it('rejects when any of the promises rejects', function() {
            var promise = $q.all([$q.when(1), $q.when(2), $q.reject('fail')]);
            var fulfilledSpy = jasmine.createSpy();
            var rejectedSpy  = jasmine.createSpy();
            promise.then(fulfilledSpy, rejectedSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).not.toHaveBeenCalled();
            expect(rejectedSpy).toHaveBeenCalledWith('fail');
        });

        it('wraps non-promises in the input collection', function() {
            var promise = $q.all([$q.when(1), 2, 3]);
            var fulfilledSpy = jasmine.createSpy();
            promise.then(fulfilledSpy);

            $rootScope.$apply();

            expect(fulfilledSpy).toHaveBeenCalledWith([1, 2, 3]);
        });

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


});


