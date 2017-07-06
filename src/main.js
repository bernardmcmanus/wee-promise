import Stack from './stack';
import asyncProvider from './async';

const PENDING = 0;
const RESOLVED = 1;
const REJECTED = 2;

export default function WeePromise(resolver) {
	const onceWrapper = once((action, value) => {
		action(this, value);
	});

	this._state = PENDING;
	this._stack = Stack();
	this.resolve = (value) => {
		onceWrapper($resolve, value);
		return this;
	};
	this.reject = (reason) => {
		onceWrapper($reject, reason);
		return this;
	};

	if (resolver) {
		try {
			resolver(this.resolve, this.reject);
		} catch(err) {
			this.reject(err);
		}
	}
}

WeePromise.async = function(cb) {
	asyncProvider(cb);
};

WeePromise.prototype.onresolved = function(value) {
	return value;
};

WeePromise.prototype.onrejected = function(reason) {
	throw reason;
};

WeePromise.prototype._flush = function() {
	const state = this._state;
	const stack = this._stack;
	if (state) {
		const flush = () => {
			const promise = stack.get();
			if (promise) {
				const fn = (state === RESOLVED ? promise.onresolved : promise.onrejected);
				try {
					$resolve(promise, fn(this._value));
				}
				catch(err) {
					$reject(promise, err);
				}
				flush();
			}
		};
		WeePromise.async(flush);
	}
};

WeePromise.prototype.then = function(onresolved, onrejected) {
	const promise = new WeePromise();
	if (isFunction(onresolved)) {
		promise.onresolved = onresolved;
	}
	if (isFunction(onrejected)) {
		promise.onrejected = onrejected;
	}
	this._stack.put(promise);
	this._flush();
	return promise;
};

WeePromise.prototype.catch = function(onrejected) {
	return this.then(undefined, onrejected);
};

WeePromise.resolve = function(result) {
	return new WeePromise().resolve(result);
};

WeePromise.reject = function(reason) {
	return new WeePromise().reject(reason);
};

WeePromise.all = function(collection) {
	const promise = new WeePromise();
	const result = [];
	const need = collection.length;
	let got = 0;

	collection.forEach((child, i) => {
		unwrap(child, (state, value) => {
			got++;
			result[i] = value;
			if (state === REJECTED) {
				promise.reject(value);
			} else if (got === need) {
				promise.resolve(result);
			}
		});
	});

	return promise;
};

WeePromise.race = function(collection) {
	const promise = new WeePromise();
	collection.forEach((child) => {
		unwrap(child, (state, value) => {
			setState(promise, state, value);
		});
	});
	return promise;
};

function $resolve(context, value) {
	if (value === context) {
		$reject(context, new TypeError('A promise cannot be resolved with itself.'));
	} else {
		unwrap(value, (state, value) => {
			setState(context, state, value);
		});
	}
}

function $reject(context, reason) {
	setState(context, REJECTED, reason);
}

function setState(context, state, value) {
	if (context._state != state) {
		context._value = value;
		context._state = state;
		context._flush();
	}
}

function unwrap(value, cb) {
	if (value instanceof WeePromise && value._state) {
		// non-pending WeePromise instances
		cb(value._state, value._value);
	} else if (isObject(value) || isFunction(value)) {
		// objects and functions
		const onceWrapper = once((fn, args) => {
			fn.apply(undefined, args);
		});
		try {
			const then = value.then;
			if (isFunction(then)) {
				then.call(value,
					(_value) => {
						onceWrapper(unwrap, [_value, cb]);
					},
					(_reason) => {
						onceWrapper(cb, [REJECTED, _reason]);
					}
				);
			} else {
				onceWrapper(cb, [RESOLVED, value]);
			}
		}
		catch(err) {
			onceWrapper(cb, [REJECTED, err]);
		}
	} else {
		// all other values
		cb(RESOLVED, value);
	}
}

function once(cb) {
	let called;
	return function() {
		if (!called) {
			cb.apply(undefined, arguments);
			called = true;
		}
	};
}

function isObject(subject) {
	return subject && typeof subject === 'object';
}

function isFunction(subject) {
	return typeof subject === 'function';
}
