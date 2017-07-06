(function() {
    "use strict";
    var global = this;
    function $$stack$$Stack() {
        var queue = [];
        var index = 0;
        var length = 0;

        function put(element) {
            queue[length] = element;
            length++;
        }

        function get() {
            var element = queue[index];
            index++;
            if (index >= length) {
                queue.length = index = length = 0;
            }
            return element;
        }

        return { put: put, get: get };
    }
    var $$stack$$default = $$stack$$Stack;

    var $$async$$asyncProvider = void 0;

    if (global.setImmediate) {
        $$async$$asyncProvider = setImmediate;
    } else if (global.MessageChannel) {
        var $$async$$stack = $$stack$$default();
        var $$async$$channel = new MessageChannel();
        $$async$$channel.port1.onmessage = function () {
            /* jshint -W084 */
            var fn = void 0;
            while (fn = $$async$$stack.get()) {
                fn();
            }
        };
        $$async$$asyncProvider = function (cb) {
            $$async$$stack.put(cb);
            $$async$$channel.port2.postMessage(0);
        };
    } else {
        $$async$$asyncProvider = setTimeout;
    }

    var $$async$$default = $$async$$asyncProvider;

    var $$main$$PENDING = 0;
    var $$main$$RESOLVED = 1;
    var $$main$$REJECTED = 2;

    function $$main$$WeePromise(resolver) {
        var _this = this;

        var onceWrapper = $$main$$once(function (action, value) {
            action(_this, value);
        });

        this._state = $$main$$PENDING;
        this._stack = $$stack$$default();
        this.resolve = function (value) {
            onceWrapper($$main$$$resolve, value);
            return _this;
        };
        this.reject = function (reason) {
            onceWrapper($$main$$$reject, reason);
            return _this;
        };

        if (resolver) {
            try {
                resolver(this.resolve, this.reject);
            } catch (err) {
                this.reject(err);
            }
        }
    }

    var $$main$$default = $$main$$WeePromise;

    $$main$$WeePromise.async = function (cb) {
        $$async$$default(cb);
    };

    $$main$$WeePromise.prototype.onresolved = function (value) {
        return value;
    };

    $$main$$WeePromise.prototype.onrejected = function (reason) {
        throw reason;
    };

    $$main$$WeePromise.prototype._flush = function () {
        var _this2 = this;

        var state = this._state;
        var stack = this._stack;
        if (state) {
            var flush = function () {
                var promise = stack.get();
                if (promise) {
                    var fn = state === $$main$$RESOLVED ? promise.onresolved : promise.onrejected;
                    try {
                        $$main$$$resolve(promise, fn(_this2._value));
                    } catch (err) {
                        $$main$$$reject(promise, err);
                    }
                    flush();
                }
            };
            $$main$$WeePromise.async(flush);
        }
    };

    $$main$$WeePromise.prototype.then = function (onresolved, onrejected) {
        var promise = new $$main$$WeePromise();
        if ($$main$$isFunction(onresolved)) {
            promise.onresolved = onresolved;
        }
        if ($$main$$isFunction(onrejected)) {
            promise.onrejected = onrejected;
        }
        this._stack.put(promise);
        this._flush();
        return promise;
    };

    $$main$$WeePromise.prototype.catch = function (onrejected) {
        return this.then(undefined, onrejected);
    };

    $$main$$WeePromise.resolve = function (result) {
        return new $$main$$WeePromise().resolve(result);
    };

    $$main$$WeePromise.reject = function (reason) {
        return new $$main$$WeePromise().reject(reason);
    };

    $$main$$WeePromise.all = function (collection) {
        var promise = new $$main$$WeePromise();
        var result = [];
        var need = collection.length;
        var got = 0;

        collection.forEach(function (child, i) {
            $$main$$unwrap(child, function (state, value) {
                got++;
                result[i] = value;
                if (state === $$main$$REJECTED) {
                    promise.reject(value);
                } else if (got === need) {
                    promise.resolve(result);
                }
            });
        });

        return promise;
    };

    $$main$$WeePromise.race = function (collection) {
        var promise = new $$main$$WeePromise();
        collection.forEach(function (child) {
            $$main$$unwrap(child, function (state, value) {
                $$main$$setState(promise, state, value);
            });
        });
        return promise;
    };

    function $$main$$$resolve(context, value) {
        if (value === context) {
            $$main$$$reject(context, new TypeError('A promise cannot be resolved with itself.'));
        } else {
            $$main$$unwrap(value, function (state, value) {
                $$main$$setState(context, state, value);
            });
        }
    }

    function $$main$$$reject(context, reason) {
        $$main$$setState(context, $$main$$REJECTED, reason);
    }

    function $$main$$setState(context, state, value) {
        if (context._state != state) {
            context._value = value;
            context._state = state;
            context._flush();
        }
    }

    function $$main$$unwrap(value, cb) {
        if (value instanceof $$main$$WeePromise && value._state) {
            // non-pending WeePromise instances
            cb(value._state, value._value);
        } else if ($$main$$isObject(value) || $$main$$isFunction(value)) {
            // objects and functions
            var onceWrapper = $$main$$once(function (fn, args) {
                fn.apply(undefined, args);
            });
            try {
                var then = value.then;
                if ($$main$$isFunction(then)) {
                    then.call(value, function (_value) {
                        onceWrapper($$main$$unwrap, [_value, cb]);
                    }, function (_reason) {
                        onceWrapper(cb, [$$main$$REJECTED, _reason]);
                    });
                } else {
                    onceWrapper(cb, [$$main$$RESOLVED, value]);
                }
            } catch (err) {
                onceWrapper(cb, [$$main$$REJECTED, err]);
            }
        } else {
            // all other values
            cb($$main$$RESOLVED, value);
        }
    }

    function $$main$$once(cb) {
        var called = void 0;
        return function () {
            if (!called) {
                cb.apply(undefined, arguments);
                called = true;
            }
        };
    }

    function $$main$$isObject(subject) {
        return subject && typeof subject === 'object';
    }

    function $$main$$isFunction(subject) {
        return typeof subject === 'function';
    }

    if (typeof exports == 'object') {
      module.exports = $$main$$default;
    } else {
      global.WeePromise = $$main$$default;
    }
}).call(this);

