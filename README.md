<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

WeePromise
===========
> An ultra light (<1k minified / gzipped) Promises / A+ implementation.

[![travis-ci](https://travis-ci.org/elnarddogg/wee-promise.svg)](https://travis-ci.org/elnarddogg/wee-promise)
[![david-dm](https://david-dm.org/elnarddogg/wee-promise.svg)](https://david-dm.org/elnarddogg/wee-promise)
![npm](https://img.shields.io/npm/v/npm.svg)

### Installation

    npm i wee-promise --save

### Usage

WeePromise supports both deferred and resolver patterns:

```javascript
function asDeferred(){
  var deferred = new WeePromise();
  doSomethingAsync( deferred.resolve );
  return deferred;
}

function asResolver(){
  return new WeePromise(function( resolve ){
    doSomethingAsync( resolve );
  });
}
```

as well as ES6-style `all` and `race` methods:

```javascript
var arr = getCollectionOfPromises();

WeePromise.all( arr ).then(function( result ){
  // result is an array of all of the promise values in arr.
});

WeePromise.race( arr ).then(function( result ){
  // result is the value of the first resolved promise in arr.
});
```

and can be extended to create objects that behave as A+ compliant promises:

```javascript
function Gnarly(){
  WeePromise.call( Gnarly );
  // ...
}

Gnarly.prototype = Object.create( WeePromise.prototype );
```

If you want to change WeePromise's async provider, just override `WeePromise.async`:

```javascript
WeePromise.async = function( cb ){
  var img = new Image();
  img.onload = img.onerror = cb;
  img.src = '';
};
```

### Build & Test

    npm i && npm run build
