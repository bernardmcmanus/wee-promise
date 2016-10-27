<a href="https://promisesaplus.com/">
	<img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

WeePromise
===========
> An ultra light (<1k minified / gzipped) Promises / A+ implementation.

[![travis-ci](https://travis-ci.org/bernardmcmanus/wee-promise.svg)](https://travis-ci.org/bernardmcmanus/wee-promise)
[![david-dm](https://david-dm.org/bernardmcmanus/wee-promise.svg)](https://david-dm.org/bernardmcmanus/wee-promise)

### Installation

	npm i wee-promise --save

### Usage

WeePromise supports both deferred and resolver patterns:

```js
function asDeferred() {
	const deferred = new WeePromise();
	doSomethingAsync(deferred.resolve);
	return deferred;
}

function asResolver() {
	return new WeePromise((resolve) => {
		doSomethingAsync(resolve);
	});
}
```

as well as ES6-style `all` and `race` methods:

```js
const arr = getCollectionOfPromises();

WeePromise.all(arr).then((result) => {
	// result is an array of all of the promise values in arr.
});

WeePromise.race(arr).then((result) => {
	// result is the value of the first resolved promise in arr.
});
```

and can be extended to create objects that behave as A+ compliant promises:

```js
class Gnarly extends WeePromise {
	// ...
}
```

If you want to change WeePromise's async provider, just override `WeePromise.async`:

```js
WeePromise.async = (cb) => {
	const img = new Image();
	img.onload = img.onerror = cb;
	img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
};
```

### Build & Test

	npm i && npm run build
