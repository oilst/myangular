/* jshint globalstrict: true */
'use strict';
function $QProvider() {
    this.$get = ['$rootScope', function ($rootScope) {

        function Deferred() {
            this.promise = new Promise();
        }

        function defer() {
            return new Deferred();
        }

        Deferred.prototype.resolve = function (value) {
            if (!this.promise.$$state.status) {
                if (value && _.isFunction(value.then)) {
                    value.then(
                        _.bind(this.resolve, this),
                        _.bind(this.reject, this)
                    );
                } else {
                    this.promise.$$state.value = value;
                    this.promise.$$state.status = 1;
                    // execute all registered success handler
                    scheduleProcessQueue(this.promise.$$state);
                }
            }
        };

        Deferred.prototype.reject = function (reason) {
            if (!this.promise.$$state.status) {
                this.promise.$$state.value = reason;
                this.promise.$$state.status = 2;
                // execute all registered reject handler
                scheduleProcessQueue(this.promise.$$state);
            }
        };


        function Promise() {
            this.$$state = {pending: []};
        }

        Promise.prototype.then = function (onFulfilled, onRejected) {
            var result = new Deferred();
            this.$$state.pending.push([result, onFulfilled, onRejected]);
            if (this.$$state.status) {
                // execute all newly added handlers
                scheduleProcessQueue(this.$$state);
            }
            return result.promise;
        };


        function scheduleProcessQueue(state) {

            $rootScope.$evalAsync(function () {

                var pending = state.pending;
                state.pending = [];
                _.forEach(pending, function (handlers) {
                    var deferred = handlers[0];
                    var fn = handlers[state.status];
                    try {
                        if (_.isFunction(fn)) {
                            deferred.resolve(fn(state.value));
                        } else if (state.status === 1) {
                            deferred.resolve(state.value);
                        } else {
                            deferred.reject(state.value);
                        }
                    } catch (e) {
                        deferred.reject (e)
                    }
                });
            });
        }


        Promise.prototype.catch = function (onRejected) {
            return this.then(null, onRejected);
        };

        Promise.prototype.finally = function (callback) {
            return this.then(function (value) {
                return handleFinallyCallback(callback, value, true);
            }, function (rejection) {
                return handleFinallyCallback(callback, rejection, false);
            });
        };

        function handleFinallyCallback(callback, value, resolved) {
            var callbackValue = callback();
            if (callbackValue && callbackValue.then) {
                return callbackValue.then(function () {
                    return resolved ? when(value) : reject(value);
                });
            } else {
                return resolved ? when(value) : reject(value);
            }
        }


        function reject(rejection) {
            var d = defer();
            d.reject(rejection);
            return d.promise;
        }

        function when(value, callback, errback) {
            var d = defer();
            d.resolve(value);
            return d.promise.then(callback, errback);
        }

        function all(promises) {
            var results = _.isArray(promises) ? [] : {};
            var counter = 0;
            var d = defer();
            _.forEach(promises, function (promise, index) {
                counter++;
                when(promise).then(function (value) {
                    results[index] = value;
                    counter--;
                    if (!counter) {
                        d.resolve(results);
                    }
                }, function (rejection) {
                    d.reject(rejection);
                });
            });
            if (!counter) {
                d.resolve(results);
            }
            return d.promise;
        }

        var $Q = function Q(resolver) {
            if (!_.isFunction(resolver)) {
                throw 'Expected function, got ' + resolver;
            }

            var d = defer();
            resolver(_.bind(d.resolve, d),
                _.bind(d.reject, d));
            return d.promise;
        };


        return {
            defer: defer,
            reject: reject,
            when: when,
            resolve: when,
            all: all
        };
    }];
}