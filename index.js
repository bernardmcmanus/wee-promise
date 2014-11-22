(function( Promise ) {

  var global = this;

  if (typeof exports === 'object') {
    module.exports = Promise;
  }
  else {
    global.Promise = global.Promise || Promise;
  }

}(function( setTimeout ) {


  var UNDEFINED;
  var PROTOTYPE = 'prototype';
  var STATE = 'state';
  var ARGS = 'args';
  var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
  var PASS = 'pass';
  var _ALWAYS = '_' + ALWAYS;
  var _THEN = '_' + THEN;
  var _CATCH = '_' + CATCH;
  var _ADD = '_add';
  var _EXEC = '_exec';
  var _READY = '_ready';

  var STATEMAP = {};
  STATEMAP[_CATCH] = -1;
  STATEMAP[_THEN] = 1;


  function Promise( func ) {

    var that = this;

    // this is implied, but unnecessary to declare explicitly
    // that[STATE] = 0;

    forEach([ ARGS , _THEN , _CATCH , _ALWAYS ] , function( key ) {
      that[key] = [];
    });

    async(function() {
      trycatch( that , function() {
        func(
          getPromiseArg( that , _THEN ),
          getPromiseArg( that , _CATCH )
        );
      });
      that[_READY] = true;
    });
  }


  Promise[ PROTOTYPE ][ _ADD ] = function( type , func ) {
    var that = this;
    if (func) {
      that[type].push( func );
    }
    return that;
  };


  Promise[ PROTOTYPE ][ _EXEC ] = function( type , args ) {

    var that = this;
    var handlers = that[type];
    var len = length( handlers );
    var i = 0;

    return trycatch( that , function() {

      while (i < len) {
        args = ( STATEMAP[type] ? handlers.shift() : handlers[i] ).apply( UNDEFINED , [ args ]);
        if (isPromise( args )) {
          return that[ PASS ]( args );
        }
        i++;
      }

      that[ARGS] = [ args ];
      that[STATE] = STATEMAP[type] || that[STATE];

      return that;
    });
  };


  Promise[ PROTOTYPE ][ ALWAYS ] = function( func ) {
    return this[ _ADD ]( _ALWAYS , func );
  };


  Promise[ PROTOTYPE ][ THEN ] = function( onresolve , onreject ) {
    return this
      [ _ADD ]( _THEN , onresolve )
      [CATCH]( onreject );
  };


  Promise[ PROTOTYPE ][ CATCH ] = function( func ) {
    return this[ _ADD ]( _CATCH , func );
  };


  Promise[ PROTOTYPE ][ PASS ] = function( promise ) {
    var that = this;
    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      promise[key] = that[key];
    });
    return promise;
  };


  Promise.all = function( arr ) {
    return new Promise(function( resolve , reject ) {
      forEach( arr , function( promise ) {
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , length( arr ))
        );
      });
    });
  };


  Promise.race = function( arr ) {
    return new Promise(function( resolve , reject ) {
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
          if (context[STATE]) {
            return;
          }
          context
          [ _EXEC ]( type , args )
          [ _EXEC ]( _ALWAYS , args );
        });
      }
    }

    return setState;
  }


  function checkArray( arr , resolve , reject , test , single ) {

    return function() {
      
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


  function filter( arr , testState ) {
    return arr.filter(function( promise ) {
      return promise[STATE] === testState;
    });
  }


  function isPromise( subject ) {
    return subject instanceof Promise;
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


  return Promise;

  
}( setTimeout )));




























