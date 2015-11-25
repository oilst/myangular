#Scope

*dirty checking*: watch and digest

*$watch*: (watchFn, listenerFn, valueEq)
whenever watchFn(scope) return a new value, listenFn((newValue, newValue, scope)) is called. valueEq decides whether _.isEqual or === is used to compare.
returns a function that can be called to destroy the watch.

*$eval(expr, locals)*
evaluates expr with parameter locals

*$apply(expr)*
evaluates exp and calls $digest on the roots scope and therefore recursively on the whole scope tree.

*$digest*
checks the watchers until no one changed

*$evalAsync*
evaluates an expression in the next digest loop. triggers digest on the root scope. Advantage over timeout is that it does it before it can render stuff or do anything else.

*$applyAsync*
evaluates in the next digest loop. In contrast to to $evalAsync it does not evaluate in the current digest cycle.

*$$postDigest*
evaluates functions after the diggest loop

*$watchGroup*
Takes an array of watchfunctions and a listener and calls the listener with all old and new values if at least one watch is dirty in the digest loop.
Returns a destroy function.


##Scope inheritance
*$new(isolated, parent):* returns a new child scope. with prototypal inheritance. If isolated is true, the child scope is isolated. if parent is defined then parent is the parent of the new scope in the scope hirarchy but it still inherits from the scope on which new is called.

*diggest on a scope:* diggests all kids recursively but not its parents!


##WatchCollections $$watchCollection(watchFn, listenerFn)
*shallow comparison* of collections and Objects returned by the watch function.
This is between the reference and the equality watch.
Implemented using watches and helper functions.


##Events
events are passed up and down the scope hirarchy
*$on(event, listener)* registers listener for event, returns a handler to deregister

*$broadcast(evenName, arg0, arg1, ... )*  calls the event with arguments. the arguments are then used for the listener function. but the first for the listener function is the event object
*$emit* similar as broadcast. But while broadcast distributes the event down the scope hierarchy, emit distributes up. On emit, a listener can stop the propagation if it calls stopPropagation on the event object.


#Expressions
always evaluate on scope


#Filters
*Example:* myExpression | uppercase:arg1:arg2

##Filter filter:
filter an array by:
- providing a filter function as argument
- providing a string or a number
- negating a condition !
- giving an object criteria (i.e. {name: "ueli"})












