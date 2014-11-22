(function( Promise ) {

  if (typeof exports === 'object') {
    module.exports = Promise;
  }
  else {
    window.Promise = window.Promise || Promise;
  }

}(function( Object , setTimeout ) {


  var PROTOTYPE = 'prototype';
  var STATE = 'state';
  var ARGS = 'args';
  var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
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

    defineProperty( that , STATE , 0 );
    defineProperty( that , ARGS , [] );
    defineProperty( that , _ALWAYS , [] );
    defineProperty( that , _THEN , [] );
    defineProperty( that , _CATCH , [] );

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

    args = [ args ];

    var that = this;
    var handlers = that[type];
    var len = length( handlers );
    var i = 0;

    trycatch( that , function() {
      while (i < len) {
        ( STATEMAP[type] ? handlers.shift() : handlers[i] ).apply( null , args );
        i++;
      }
    });

    that[ARGS] = args;
    that[STATE] = STATEMAP[type] || that[STATE];

    return that;
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


  function defineProperty( context , name , value ) {
    Object.defineProperty( context , name , {
      value: value,
      writable: true
    });
  }


  function async( callback ) {
    setTimeout( callback , 1 );
  }


  function trycatch( context , func ) {
    try {
      func();
    }
    catch ( err ) {
      context[ _EXEC ]( _CATCH , err );
    }
  }


  function length( subject ) {
    return subject.length;
  }


  function forEach( subject , callback ) {
    subject.forEach( callback );
  }


  return Promise;

  
}( Object , setTimeout )));




























