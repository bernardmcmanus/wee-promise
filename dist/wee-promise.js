/*! wee-promise - 1.0.0 - Bernard McManus - ab9e766 - 2015-12-09 */

(function(UNDEFINED){
"use strict";
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
      WeePromise.async(function(){
        (function flush(){
          var deferred = that._stack.get();
          if (deferred) {
            var fn = (state == RESOLVED ? deferred.onresolved : deferred.onrejected);
            try {
              $resolve( deferred , fn( that._value ));
            }
            catch( err ){
              $reject( deferred , err );
            }
            flush();
          }
        }());
      });
    }
  },
  then: function( onresolved , onrejected ){
    var that = this,
      deferred = new WeePromise();
    if (isFunction( onresolved )) {
      deferred.onresolved = onresolved;
    }
    if (isFunction( onrejected )) {
      deferred.onrejected = onrejected;
    }
    that._stack.put( deferred );
    that._flush();
    return deferred;
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
  var deferred = new WeePromise(),
    result = [],
    got = 0,
    need = collection.length;
  collection.forEach(function( child , i ){
    unwrap( child , function( state , value ){
      got++;
      result[i] = value;
      if (state == REJECTED) {
        deferred.reject( value );
      }
      else if (got == need) {
        deferred.resolve( result );
      }
    });
  });
  return deferred;
};

WeePromise.race = function( collection ){
  var deferred = new WeePromise();
  collection.forEach(function( child ){
    unwrap( child , function( state , value ){
      setState( deferred , state , value );
    });
  });
  return deferred;
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
    context._value = value;
    context._state = state;
    context._flush();
  }
}

function unwrap( value , cb ){
  if (value instanceof WeePromise && value._state) {
    // fulfilled WeePromise instances
    cb( value._state , value._value );
  }
  else if (!isObject( value ) && !isFunction( value )) {
    // primitives
    cb( RESOLVED , value );
  }
  else {
    // all other objects and functions
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

WeePromise.async = (function(){
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
  return function( cb ){
    setTimeout( cb );
  };
}());

if (typeof exports == "object") {
module.exports = WeePromise;
} else {
self.WeePromise = WeePromise;
}
}());