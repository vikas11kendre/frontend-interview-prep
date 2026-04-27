Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

Function.prototype.myApply = function(context, argsArray) {
  context = context || globalThis;
  argsArray = argsArray || [];
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...argsArray);
  delete context[fnSymbol];
  return result;
};

Function.prototype.myBind = function(context, ...args) {
  const originalFunction = this;
  context = context || globalThis;
   function boundFunction (...newArgs) {
    return originalFunction.myCall(   this instanceof boundFunction ? this : context, ...args, ...newArgs);
  };
    boundFunction.prototype = Object.create(originalFunction.prototype);
return boundFunction
};

const BoundPerson = Person.myBind({ name: 'wrong' });
const p = new BoundPerson('Rahul');
console.log(p.name); // "wrong" or "Rahul"?