#Java Script

##Reading
- [You don't know Java Script](https://github.com/getify/You-Dont-Know-JS/)

##Scopes
- *Variable initialization*: the JS compiler first parses the whole code and creates all variables that are defined. Therefore, you can use them before the initialization. 
- *Scope*: every function has its own scope. Every scope (except for the root scope) has a parent scope. Blocks (if, for, etc.) do not define scopes. That is why a variable from an if block also exists outside. (The only exception to this is 'catch' which creates a block).
- *Variable lookup*: for a LHS or RHS variable lookup the compiler looks first into the current scope and then travels up the scope hierarchy. For an LHS lookup the variable is created if it does not exist. 
- *Strict mode*: If we use strict mode, then undefined variables are not created but we get a ReferenceError.
- *let in ES6*: with let we can initialize variables that only exist inside there block. 
- *function as scopes*:
                        
                        
                       (function foo(){ // <-- insert this
                           var a = 3;
                           console.log( a ); // 3
                       })(); // <-- and this

                        
##Scopes
Variable and function declarations (not the assignments!) are moved to the top of their scope. Multiple variable declarations are ignored. Multiple function declarations overwrite each others. Function declarations have priority over variable declarations.   
                     
##Closure
If you defined a function from outside, its scope (and parent scopes) are preserved as long as you maintain the reference. Whenever it is called, it is called with the scopes. We say it has closure over its parent scopes. 

Example:

    function foo() {
        var a = 2;
    
        function bar() {
            console.log( a );
        }
    
        return bar;
    }
    var baz = foo();
    baz(); // 2 -- Whoa, closure was just observed, man.

This only works because of closure:

```javascript    
    
    function wait(message) {
    
        setTimeout( function timer(){
            console.log( message );
        }, 1000 );
    
    }
    wait( "Hello, closure!" );
```

This returns five times the integer 6:
```javascript

    for (var i=1; i<=5; i++) {
        setTimeout( function timer(){
            console.log( i );
        }, i*1000 );
    }
 ```
 But with closure we can fix it to work as expected:

```javascript
 
     for (var i=1; i<=5; i++) {
         (function(j){
             setTimeout( function timer(){
                 console.log( j );
             }, j*1000 );
         })( i );
     }
  ```

'let' has some special features in loops. If you use it in a for loop it will generate a function scope for each iteration. 

##Module Pattern
The module pattern is a pure example of closure. It doesn't need any additional language support: 
```javascript

    function CoolModule() {
        var something = "cool";
        var another = [1, 2, 3];
    
        function doSomething() {
            console.log( something );
        }
    
        function doAnother() {
            console.log( another.join( " ! " ) );
        }
    
        return {
            doSomething: doSomething,
            doAnother: doAnother
        };
    }

    var foo = CoolModule();
    
    foo.doSomething(); // cool
    foo.doAnother(); // 1 ! 2 ! 3
 ```

##this
- this does not reference the function scope. 
- depending on how the function has been called, the this reference points to a different object. 
- call site: this is the default binding if func has been called `func()`. This points to the scope in which `func` has been called. Does not work if the function called runs in strict mode. In this case this is undefined. 
- Implicit binding: If the functions has been called on an object `obj.func()`, then this is bound to `obj`. It does not work if you pass a function like `obj.func` as a callback. It only works if its called exactly like this: `obj.func()`.

## Getter/Setter
```javascript

    var person = {
        firstName: 'Jimmy',
        lastName: 'Smith',
        get fullName() {
            return this.firstName + ' ' + this.lastName;
        },
        set fullName (name) {
            var words = name.toString().split(' ');
            this.firstName = words[0] || '';
            this.lastName = words[1] || '';
        }
    }
    
    person.fullName = 'Jack Franklin';
    console.log(person.firstName); // Jack
    console.log(person.lastName) // Franklin
```


##Technologies to check
- GraphQL: https://github.com/chentsulin/awesome-graphql
- REdux: https://gist.github.com/btroncone/a6e4347326749f938510


 Todo: 
 -singleton pattern
 -prototypes
 
 



















