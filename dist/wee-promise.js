/*! wee-promise - 1.0.0 - Bernard McManus - 799db9e - 2015-12-08 */

(function(Object,setTimeout,TypeError,UNDEFINED){
"use strict";
var asap = (function(){
  var _undefined = '' + UNDEFINED;
  if (typeof setImmediate != _undefined) {
    return setImmediate;
  }
  else if (typeof MessageChannel != _undefined) {
    return function( cb ){
      var channel = new MessageChannel();
      channel.port1.onmessage = function(){
        cb();
      };
      channel.port2.postMessage( 0 );
    };
  }
  return setTimeout;
}());

function Stack(){
  var that = this;
  that.q = [];
  that.i = 0;
  that.len = 0;
}

Stack.prototype.put = function( element ){
  var that = this;
  that.q[that.len] = element;
  that.len++;
};

Stack.prototype.get = function(){
  var that = this,
    element = that.q[that.i];
    that.i++;
    if (that.i == that.len) {
      that.q.length = that.i = that.len = 0;
    }
    return element;
};


var RESOLVED = 1;
var REJECTED = 2;

function WeePromise( resolver ){
  var that = this,
    one = getSingleCallable(function( action , value ){
      action( that , value );
    });
  that._stack = new Stack();
  that.resolve = function( value ){
    one( $resolve , value );
    return that;
  };
  that.reject = function( reason ){
    one( $reject , reason );
    return that;
  };
  if (resolver) {
    try {
      resolver( that.resolve , that.reject );
    }
    catch( err ){
      that.reject( err );
    }
  }
}

WeePromise.prototype = {
  constructor: WeePromise,
  onresolved: function( value ){
    return value;
  },
  onrejected: function( reason ){
    throw reason;
  },
  _flush: function(){
    var that = this,
      state = that._state;
    if (state) {
      asap(function(){
        (function flush(){
          var enqueued = that._stack.get();
          if (enqueued) {
            var fn = (state == RESOLVED ? enqueued.onresolved : enqueued.onrejected);
            try {
              $resolve( enqueued , fn( that.value ));
            }
            catch( err ){
              $reject( enqueued , err );
            }
            flush();
          }
        }());
      });
    }
  },
  then: function( onresolved , onrejected ){
    var that = this,
      promise = new WeePromise();
    if (isFunction( onresolved ))
      promise.onresolved = onresolved;
    if (isFunction( onrejected ))
      promise.onrejected = onrejected;
    that._stack.put( promise );
    that._flush();
    return promise;
  },
  catch: function( onrejected ){
    return this.then( UNDEFINED , onrejected );
  }
};

WeePromise.resolve = function( result ){
  return new WeePromise().resolve( result );
};

WeePromise.reject = function( reason ){
  return new WeePromise().reject( reason );
};

WeePromise.all = function( collection ){
  var promise = new WeePromise(),
    result = [],
    got = 0,
    need = collection.length;
  collection.forEach(function( child , i ){
    unwrap( child , function( state , value ){
      got++;
      result[i] = value;
      if (state == REJECTED) {
        promise.reject( value );
      }
      else if (got == need) {
        promise.resolve( result );
      }
    });
  });
  return promise;
};

WeePromise.race = function( collection ){
  var promise = new WeePromise();
  collection.forEach(function( child ){
    unwrap( child , function( state , value ){
      setState( promise , state , value );
    });
  });
  return promise;
};

function $resolve( context , value ){
  if (value === context) {
    $reject( context , new TypeError( 'A promise cannot be resolved with itself.' ));
  }
  else {
    unwrap( value , function( state , value ){
      setState( context , state , value );
    });
  }
}

function $reject( context , reason ){
  setState( context , REJECTED , reason );
}

function setState( context , state , value ){
  if (context._state != state) {
    context.value = value;
    context._state = state;
    context._flush();
  }
}

function unwrap( value , cb ){
  if (value instanceof WeePromise && value._state) {
    cb( value._state , value.value );
  }
  else if (isObject( value ) || isFunction( value )) {
    var then,
      one = getSingleCallable(function( fn , args ){
        fn.apply( UNDEFINED , args );
      });
    try {
      then = value.then;
      if (isFunction( then )) {
        then.call( value,
          function( v ){
            one( unwrap , [ v , cb ]);
          },
          function( r ){
            one( cb , [ REJECTED , r ]);
          }
        );
      }
      else {
        one( cb , [ RESOLVED , value ]);
      }
    }
    catch( err ){
      one( cb , [ REJECTED , err ]);
    }
  }
  else {
    cb( RESOLVED , value );
  }
}

function getSingleCallable( cb ){
  var called;
  return function(){
    if (!called) {
      cb.apply( UNDEFINED , arguments );
      called = true;
    }
  };
}

function isObject( subject ){
  return subject && typeof subject == 'object';
}

function isFunction( subject ){
  return typeof subject == 'function';
}

if (typeof exports == "object") {
module.exports = WeePromise;
} else {
self.WeePromise = WeePromise;
}
}(Object,setTimeout,TypeError));