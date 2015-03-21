(function( WeePromise ) {

  var global = this;

  if (typeof exports == 'object') {
    module.exports = WeePromise;
  }
  else {
    global.WeePromise = WeePromise;
  }

}(function( setTimeout ) {

  'use strict';


  var UNDEFINED;
  var PRIVATE = '$$';
  var PROTOTYPE = 'prototype';
  var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
  var _PASS = PRIVATE + 'pass';
  var _STATE = PRIVATE + 'state';
  var _ARGS = PRIVATE + 'args';
  var _ALWAYS = PRIVATE + ALWAYS;
  var _THEN = PRIVATE + THEN;
  var _CATCH = PRIVATE + CATCH;
  var _ADD = PRIVATE + 'add';
  var _EXEC = PRIVATE + 'exec';
  var _READY = PRIVATE + 'ready';
  var _CHILD = PRIVATE + 'child';
  var _HANDLED = PRIVATE + 'handled';
  var _HANDLED_SELF = _HANDLED + 'Self';

  var STATEMAP = {};
  STATEMAP[_THEN] = 1;
  STATEMAP[_CATCH] = -1;


  function WeePromise( func ) {

    var that = this;

    // that[_STATE] = 0;
    // that[_ARGS] = [];
    // that[_READY] = false;
    // that[_HANDLED] = false;
    // that[_HANDLED_SELF] = false;
    // that[_CHILD] = false;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      that[key] = [];
    });

    async(function() {
      
      that[_HANDLED] = isHandled( that );
      
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
    var state = STATEMAP[type], returned;

    return trycatch( that , function() {

      while (i < len) {

        if (state && that[_STATE] === state && that[_CHILD] && that[_HANDLED]) {
          
          handlers = !that[_HANDLED_SELF] || that[_READY] ? [] : handlers.slice( -1 );
          i = len - 1;

          if (!length( handlers )) {
            return that;
          }
        }

        returned = ( state ? handlers.shift() : handlers[i] ).apply( UNDEFINED , [ args ]);
        args = state ? returned : args;

        if (isPromise( returned )) {
          return that[ _PASS ]( returned );
        }
        else if (type == _CATCH) {
          if (that[_HANDLED]) {
            state = STATEMAP[_THEN];
            if (that[_CHILD]) {
              that[_STATE] = state;
              that[_ARGS] = [ returned ];
              return that
                [ _EXEC ]( _THEN , returned )
                [ _EXEC ]( _ALWAYS , returned );
            }
          }
          break;
        }

        i++;
      }

      that[_ARGS] = that[_STATE] ? that[_ARGS] : [ args ];
      that[_STATE] = state || that[_STATE];

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


  WeePromise[ PROTOTYPE ][ _PASS ] = function( promise ) {
    
    var that = this;
    
    promise[_HANDLED_SELF] = isHandled( promise );
    promise[_CHILD] = true;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      promise[key] = (promise[_HANDLED_SELF] ? promise[key].concat( that[key] ) : that[key]);
    });

    that[_ARGS] = promise;

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
          if (!context[_STATE]) {
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
        return isPromise( promise[_ARGS] ) ? promise[_ARGS] : promise;
      });
      
      var resolved = filter( arr , 1 );
      var rejected = filter( arr , -1 );

      if (length( resolved ) === test) {

        var args = resolved.map(function( promise ) {
          return promise[_ARGS][0];
        });
        
        resolve( single ? args[0] : args );
      }
      else if (length( rejected ) > 0) {
        reject(
          rejected[0][_ARGS][0]
        );
      }
    };
  }


  function isHandled( subject ) {
    return length(subject[ _CATCH ]) > 0;
  }


  function filter( arr , testState ) {
    return arr.filter(function( promise ) {
      return (/*!isPromise( promise ) ||*/ (promise[_STATE] === testState));
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




























