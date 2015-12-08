/* {debug} */
  if (typeof require == 'function') {
    var assert = require( 'assert' );
    var colors = require( 'colors' );
    /* jshint -W082 */
    function logError( err ){
      try {
        var trace = err.stack || err.message || err.toString();
        var message = trace.match( /(.+)/ )[1];
        var stack = trace.match( /[^\n]+((.|\n)+)/i )[1];
        console.log( '\n' + message.red + stack.gray );
      }
      catch( error ) {
        console.log( error.stack );
      }
    }
  }
/* {/debug} */

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
              /* {debug} */
                if (typeof assert != 'undefined' && err instanceof assert.AssertionError) {
                  logError( err );
                }
                else if (typeof chai != 'undefined' && err instanceof chai.AssertionError) {
                  console.log( err );
                }
              /* {/debug} */
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
