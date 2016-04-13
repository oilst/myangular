#Promises

##Reading
- [building a (non angular) promise implementation](http://www.mattgreer.org/articles/promises-in-wicked-detail/)
- [guide on using promises in js](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20&%20performance/ch3.md)
- [promises and reactivity](https://github.com/kriskowal/gtor)

##Basics
- *Deferred*: the computation that makes a promised value available. Usually used by the producer. The value of the promise becomes available if the producer calls `resolve()` or `reject()` on the deferred. (ES6 has no deferred)
- *Promise*: a promise that some value will be available in the future. Usually used by the consumer. The promise is retrived by calling `promise()` on the deferred. When the deferred becomes resolved or rejected, one of the call backs provided by `then()` is called.
- *promise.catch(action)*: just syntactic sugar for `promise.then(null, action)`
- *q.reject(reason)*: returns a promise that is immediately rejected. 
- *q.when()*: wraps anything into a promise. One way to see it is as the oponent of 'q.reject'. It can also be used to convert thenable objects into angular promises. 
- *q.all()* takes a collection of promises and values. If all promises resolve it returns a promise that contains a collection of same type that contains the results. If at least one of them rejects, it returns a rejected promise that contains the results. 

##Interesting Facts
- Promises are not resolved immediately when resolve is called, but only in the next diggest cycle. In other promise libraries this is achived by timeout. The drawback is that by this they give controll back to the browser, while in angular an immediately resolved promise can be worked on in the same diggest loop. 
- We can have several callbacks. If a call back is registered while the value is already available, it gets executed.  
- *Chaining* the then function returns a promise that contains the result of the callback. If there is no handler for the state of the promise, then current value and its state is returned. The rejection handler (or catch) always returns a resolved promise.
- *Exception handling* when a callback crashes, it returns a rejected promise with the exception value
- *propagation* if we resolve with a promise or return a promise from a callback, the nested promises are propagated. The resolve of the top most promise registers its resolve and reject to the lower promise so it gets only resolved if the lower promise is resolved. **This does not work for rejecting promises.** 
- *finally* does not change the promise. if finally is called on a rejected promise it returns a rejected promise with the same value. If finally returns a promise, then its callbacks wait till the promise is resolved or rejected, but they still get the value of the input promise. The only exception is, when the promise returned by finally is rejected, then the next handlers get a rejected promise.


##Additional 
- *Notify* there is a third handler, the notify handler. The advantage of this is that it can be called several times. 




 



















