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
                        ```javascript
                       (function foo(){ // <-- insert this
                       
                           var a = 3;
                           console.log( a ); // 3
                       
                       })(); // <-- and this
                        ```
                        





 



















