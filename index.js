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

  
  var log = (function() {
    try {
      var util = require( 'util' );
      return function() {
        var args = Array.prototype.slice.call( arguments , 0 );
        args = args.map(function( arg ) {
          return util.inspect.apply( util , [ arg , { colors: true, depth: 3 }]);
        });
        console.log.apply( console , args );
      };
    }
    catch( err ) {
      return function() {
        var args = Array.prototype.slice.call( arguments , 0 );
        console.log.apply( console , args );
      };
    }
  }());


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
  STATEMAP[_THEN] = 1;
  STATEMAP[_CATCH] = -1;


  function WeePromise( func ) {

    var that = this;

    // that[STATE] = 0;
    // that[ARGS] = [];
    // that[_READY] = false;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      that[key] = [];
    });

    async(function() {

      /*if (that.__CHILD !== UNDEFINED) {
        debugger;
      }*/
      
      that.caught = !!length(that[ _CATCH ]);
      
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
    var handler, returned;

    return trycatch( that , function() {

      while (i < len) {

        //returned = ( STATEMAP[type] ? handlers.shift() : handlers[i] ).apply( UNDEFINED , [ args ]);

        if (STATEMAP[type] && that[STATE] === STATEMAP[type] && !that.caughtInit) {
          break;
        }

        handler = STATEMAP[type] ? handlers.shift() : handlers[i];
        returned = handler.apply( UNDEFINED , [ args ]);
        args = STATEMAP[type] ? returned : args;

        if (isPromise( returned )) {
          that[STATE] = STATEMAP[type] || that[STATE];
          return that[ PASS ]( returned , type );
        }
        else if (type === _CATCH && that.caught && that.isChild) {
          //debugger;
          that[STATE] = STATEMAP[_THEN];
          that[ARGS] = /*that[STATE] ? that[ARGS] : */[ returned ];
          return that[ _EXEC ]( _THEN , returned );
        }
        else if (type == _CATCH) {
          break;
        }
        i++;
      }

      that[ARGS] = that[STATE] ? that[ARGS] : [ args ];
      that[STATE] = STATEMAP[type] || that[STATE];

      if (type === _CATCH && that.caught && !that.isParent) {
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
    promise.caughtInit = !!length(promise[ _CATCH ]);
    that.isParent = true;
    promise.isChild = true;
    /*if (promise.__CHILD !== UNDEFINED) {
      debugger;
    }*/
    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      if (key !== type) {
        promise[key] = promise[key].concat( that[key] );
      }
      else {
        promise[key] = that[key];
      }
    });
    that[ARGS] = promise;
    return promise;
  };


  WeePromise.all = function( arr ) {
    /*forEach( arr , function( promise ) {
      promise.isMember = true;
    });*/
    var p = new WeePromise(function( resolve , reject ) {
      //p.isList = true;
      forEach( arr , function( promise ) {
        //promise.isMember = true;
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , length( arr ))
        );
      });
    });
    return p;
  };


  WeePromise.race = function( arr ) {
    /*forEach( arr , function( promise ) {
      promise.isMember = true;
    });*/
    var p = new WeePromise(function( resolve , reject ) {
      //p.isList = true;
      forEach( arr , function( promise ) {
        //promise.isMember = true;
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , 1 , true )
        );
      });
    });
    return p;
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
        return isPromise( promise[ARGS] ) ? promise[ARGS] : arr[i];
      });
      /*arr = arr.map(function( promise ) {
        return isPromise( promise[ARGS] ) ? promise[ARGS] : promise;
      });*/
      /*log(arr.map(function( promise ) {
        return promise.args;
      }));*/
      
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




























