/* {debug} */
  if (typeof require == 'function') {
    var assert = require( 'assert' );
    var colors = require( 'colors' );
    /* jshint -W082 */
    var logError = function( err ){
      try {
        var trace = err.stack || err.message || err.toString();
        var message = trace.match( /(.+)/ )[1];
        var stack = trace.match( /[^\n]+((.|\n)+)/i )[1];
        console.log( '\n' + message.red + stack.gray );
      }
      catch( error ){
        console.log( error.stack );
      }
    };
  }
/* {/debug} */

var PENDING = 0,
  RESOLVED = 1,
  REJECTED = 2;

function WeePromise( resolver ){
  var that = this,
    one = getSingleCallable(function( action , value ){
      action( that , value );
    });
  that._state = PENDING;
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

WeePromise.prototype.onresolved = function( value ){
  return value;
};

WeePromise.prototype.onrejected = function( reason ){
  throw reason;
};

WeePromise.prototype._flush = function(){
  var that = this,
    state = that._state;
  if (state) {
    WeePromise.async(function(){
      (function flush(){
        var promise = that._stack.get();
        if (promise) {
          var fn = (state == RESOLVED ? promise.onresolved : promise.onrejected);
          try {
            $resolve( promise , fn( that._value ));
          }
          catch( err ){
            /* {debug} */
              if (typeof assert != 'undefined' && err instanceof assert.AssertionError) {
                logError( err );
              }
              else if (typeof chai != 'undefined' && err instanceof chai.AssertionError) {
                console.log( err );
              }
            /* {/debug} */
            $reject( promise , err );
          }
          flush();
        }
      }());
    });
  }
};

WeePromise.prototype.then = function( onresolved , onrejected ){
  var that = this,
    promise = new WeePromise();
  if (isFunction( onresolved )) {
    promise.onresolved = onresolved;
  }
  if (isFunction( onrejected )) {
    promise.onrejected = onrejected;
  }
  that._stack.put( promise );
  that._flush();
  return promise;
};

WeePromise.prototype.catch = function( onrejected ){
  return this.then( UNDEFINED , onrejected );
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
    context._value = value;
    context._state = state;
    context._flush();
  }
}

function unwrap( value , cb ){
  if (value instanceof WeePromise && value._state) {
    // non-pending WeePromise instances
    cb( value._state , value._value );
  }
  else if (isObject( value ) || isFunction( value )) {
    // objects and functions
    var then,
      one = getSingleCallable(function( fn , args ){
        fn.apply( UNDEFINED , args );
      });
    try {
      then = value.then;
      if (isFunction( then )) {
        then.call( value,
          function( _value ){
            one( unwrap , [ _value , cb ]);
          },
          function( _reason ){
            one( cb , [ REJECTED , _reason ]);
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
    // all other values
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
