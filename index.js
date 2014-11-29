(function( WeePromise ) {

  var global = this;

  if (typeof exports == 'object') {
    module.exports = WeePromise;
  }
  else {
    global.WeePromise = WeePromise;
    global.Promise = global.Promise || WeePromise;
  }

}(function( setTimeout ) {


  var UNDEFINED;
  var __ = '__';
  var PROTOTYPE = 'prototype';
  var STATE = 'state';
  var ARGS = 'args';
  var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
  var PASS = __ + 'pass';
  var _ALWAYS = __ + ALWAYS;
  var _THEN = __ + THEN;
  var _CATCH = __ + CATCH;
  var _ADD = __ + 'add';
  var _EXEC = __ + 'exec';
  var _READY = __ + 'ready';
  var _CHILD = __ + 'child';
  var _CAUGHT = __ + 'caught';
  var _CAUGHT_SELF = _CAUGHT + 'Self';

  var STATEMAP = {};
  STATEMAP[_THEN] = 1;
  STATEMAP[_CATCH] = -1;


  function WeePromise( func ) {

    var that = this;

    // that[STATE] = 0;
    // that[ARGS] = [];
    // that[_READY] = false;
    // that[_CAUGHT] = false;
    // that[_CAUGHT_SELF] = false;
    // that[_CHILD] = false;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      that[key] = [];
    });

    async(function() {
      
      that[_CAUGHT] = isCaught( that );
      
      trycatch( that , function() {
        func(
          getPromiseArg( that , _THEN ),
          getPromiseArg( that , _CATCH )
        );
      });

      that[_READY] = true;

    });
  }


  WeePromise[ PROTOTYPE ][ _ADD ] = function( type , func ) {
    var that = this;
    if (func) {
      that[type].push( func );
    }
    return that;
  };


  WeePromise[ PROTOTYPE ][ _EXEC ] = function( type , args ) {

    var that = this;
    var handlers = that[type];
    var len = length( handlers );
    var i = 0;
    var returned;

    return trycatch( that , function() {

      while (i < len) {

        if (STATEMAP[type] && that[STATE] === STATEMAP[type] && !that[_CAUGHT_SELF]) {
          break;
        }

        returned = ( STATEMAP[type] ? handlers.shift() : handlers[i] ).apply( UNDEFINED , [ args ]);
        args = STATEMAP[type] ? returned : args;

        if (isPromise( returned )) {
          return that[ PASS ]( returned , type );
        }
        else if (type === _CATCH) {
          if (that[_CAUGHT] && that[_CHILD]) {
            that[STATE] = STATEMAP[_THEN];
            that[ARGS] = [ returned ];
            return that[ _EXEC ]( _THEN , returned );
          }
          break;
        }
        i++;
      }

      that[ARGS] = that[STATE] ? that[ARGS] : [ args ];
      that[STATE] = STATEMAP[type] || that[STATE];

      if (type === _CATCH && that[_CAUGHT]) {
        that[STATE] = STATEMAP[_THEN];
      }

      return that;

    });
  };


  WeePromise[ PROTOTYPE ][ ALWAYS ] = function( func ) {
    return this[ _ADD ]( _ALWAYS , func );
  };


  WeePromise[ PROTOTYPE ][ THEN ] = function( onresolve , onreject ) {
    return this
      [ _ADD ]( _THEN , onresolve )
      [CATCH]( onreject );
  };


  WeePromise[ PROTOTYPE ][ CATCH ] = function( func ) {
    return this[ _ADD ]( _CATCH , func );
  };


  WeePromise[ PROTOTYPE ][ PASS ] = function( promise , type ) {
    
    var that = this;
    
    promise[_CAUGHT_SELF] = isCaught( promise );
    promise[_CHILD] = true;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      promise[key] = (key != type ? promise[key].concat( that[key] ) : that[key]);
    });

    that[ARGS] = promise;

    return promise;
  };


  WeePromise.all = function( arr ) {
    return new WeePromise(function( resolve , reject ) {
      forEach( arr , function( promise ) {
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , length( arr ))
        );
      });
    });
  };


  WeePromise.race = function( arr ) {
    return new WeePromise(function( resolve , reject ) {
      forEach( arr , function( promise ) {
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , 1 , true )
        );
      });
    });
  };


  function getPromiseArg( context , type ) {

    function setState( args ) {
      if (!context[_READY]) {
        async(function() {
          setState( args );
        });
      }
      else {
        async(function() {
          if (!context[STATE]) {
            context
            [ _EXEC ]( type , args )
            [ _EXEC ]( _ALWAYS , args );
          }
        });
      }
    }

    return setState;
  }


  function checkArray( arr , resolve , reject , test , single ) {

    return function() {

      arr = arr.map(function( promise , i ) {
        return isPromise( promise[ARGS] ) ? promise[ARGS] : promise;
      });
      
      var resolved = filter( arr , 1 );
      var rejected = filter( arr , -1 );

      if (length( resolved ) === test) {

        var args = resolved.map(function( promise ) {
          return promise[ARGS][0];
        });
        
        resolve( single ? args[0] : args );
      }
      else if (length( rejected ) > 0) {
        reject(
          rejected[0][ARGS][0]
        );
      }
    };
  }


  function isCaught( subject ) {
    return length(subject[ _CATCH ]) > 0;
  }


  function filter( arr , testState ) {
    return arr.filter(function( promise ) {
      return promise[STATE] === testState;
    });
  }


  function isPromise( subject ) {
    return subject instanceof WeePromise;
  }


  function async( callback ) {
    setTimeout( callback , 1 );
  }


  function trycatch( context , func ) {
    try {
      return func();
    }
    catch ( err ) {
      return context[ _EXEC ]( _CATCH , err );
    }
  }


  function length( subject ) {
    return subject.length;
  }


  function forEach( subject , callback ) {
    subject.forEach( callback );
  }


  return WeePromise;

  
}( setTimeout )));




























