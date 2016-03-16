#Promises

##Reading
- [building a (non angular) promise implementation](http://www.mattgreer.org/articles/promises-in-wicked-detail/)
- [guide on using promises in js](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20&%20performance/ch3.md)
- [promises and reactivity](https://github.com/kriskowal/gtor)

##Basics
- *Deferred*: the computation that makes a promised value available. Usually used by the producer. The value of the promise becomes available if the producer calls `resolve()` or `reject()` on the deferred. (ES6 has no deferred)
- *Promise*: a promise that some value will be available in the future. Usually used by the consumer. The promise is retrived by calling `promise()` on the deferred. When the deferred becomes resolved or rejected, one of the call backs provided by `then()` is called.
- *promise.catch(action)*: just syntactic sugar for `promise.then(null, action)`

##Interesting Facts
- Promises are not resolved immediately when resolve is called, but only in the next diggest cycle. In other promise libraries this is achived by timeout. The drawback is that by this they give controll back to the browser, while in angular an immediately resolved promise can be worked on in the same diggest loop. 
- We can have several callbacks. If a call back is registered while the value is already available, it gets executed.  
 



















