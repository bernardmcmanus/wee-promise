(function( WeePromise ){
  if (typeof exports == 'object') {
    module.exports = WeePromise;
  }
  else {
    this.WeePromise = WeePromise;
  }
}(function( setTimeout , UNDEFINED ){
  'use strict';

  var PROTOTYPE = 'prototype';
  var RESOLVE = 'resolve';
  var REJECT = 'reject';
  var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
  var PENDING = UNDEFINED;
  var RESOLVED = 1;
  var REJECTED = 2;
  var _PASS = '_pass';
  var _STATE = '_state';
  var _RESULT = '_result';
  var _ALWAYS = '_' + ALWAYS;
  var _THEN = '_' + THEN;
  var _CATCH = '_' + CATCH;
  var _ADD = '_add';
  var _EXEC = '_exec';
  var _READY = '_ready';
  var _CHILD = '_child';
  var _HANDLED = '_handled';
  var _HANDLED_SELF = _HANDLED + 'Self';

  var STATEMAP = {};
  STATEMAP[_THEN] = RESOLVED;
  STATEMAP[_CATCH] = REJECTED;

  function WeePromise( resolver ){
    var that = this;
    // that[_STATE] = PENDING;
    // that[_RESULT] = [];
    // that[_READY] = false;
    // that[_HANDLED] = false;
    // that[_HANDLED_SELF] = false;
    // that[_CHILD] = false;
    forEach([ _THEN , _CATCH , _ALWAYS ], function( key ){
      that[key] = [];
    });
    
    that[RESOLVE] = getPromiseArg( that , _THEN );
    that[REJECT] = getPromiseArg( that , _CATCH );
    
    setTimeout(function(){
      that[_HANDLED] = isHandled( that );
      if (resolver) {
        trycatch( that , function(){
          resolver( that[RESOLVE] , that[REJECT] );
        });
      }
      that[_READY] = true;
    });
  }

  WeePromise[ PROTOTYPE ][ _ADD ] = function( type , func ){
    var that = this;
    if (func) {
      that[type].push( func );
    }
    return that;
  };

  WeePromise[ PROTOTYPE ][ _EXEC ] = function( type , result ){
    var that = this,
      handlers = that[type],
      len = length( handlers ),
      state = STATEMAP[type] || PENDING,
      i = 0,
      result;
    return trycatch( that , function(){
      while (i < len) {
        if (state && that[_STATE] === state && that[_CHILD] && that[_HANDLED]) {
          handlers = !that[_HANDLED_SELF] || that[_READY] ? [] : handlers.slice( -1 );
          i = len - 1;
          if (!length( handlers )) {
            return that;
          }
        }
        result = ( state ? handlers.shift() : handlers[i] ).apply( UNDEFINED , [ result ]);
        if (isThenable( result )) {
          return that[ _PASS ]( result );
        }
        else if (type == _CATCH) {
          if (that[_HANDLED]) {
            state = STATEMAP[_THEN];
            if (that[_CHILD]) {
              that[_STATE] = state;
              that[_RESULT] = [ result ];
            }
            return that
              [ _EXEC ]( _THEN , result )
              [ _EXEC ]( _ALWAYS , result );
          }
          break;
        }
        i++;
      }
      that[_RESULT] = (that[_STATE] ? that[_RESULT] : [ result ]);
      that[_STATE] = that[_STATE] || state;
      return that;
    });
  };

  WeePromise[ PROTOTYPE ][ ALWAYS ] = function( func ){
    return this[ _ADD ]( _ALWAYS , func );
  };

  WeePromise[ PROTOTYPE ][ THEN ] = function( onresolve , onreject ){
    return this
      [ _ADD ]( _THEN , onresolve )
      [CATCH]( onreject );
  };

  WeePromise[ PROTOTYPE ][ CATCH ] = function( func ){
    return this[ _ADD ]( _CATCH , func );
  };

  WeePromise[ PROTOTYPE ][ _PASS ] = function( promise ){
    var that = this;
    promise[_HANDLED_SELF] = isHandled( promise );
    promise[_CHILD] = true;
    forEach([ _THEN , _CATCH , _ALWAYS ], function( key ){
      promise[key] = (promise[_HANDLED_SELF] ? promise[key].concat( that[key] ) : that[key]);
    });
    that[_RESULT] = promise;
    return promise;
  };

  WeePromise[ RESOLVE ] = function( result ){
    var promise = new WeePromise();
    promise[RESOLVE]( result );
    return promise;
  };

  WeePromise[ REJECT ] = function( reason ){
    var promise = new WeePromise();
    promise[REJECT]( reason );
    return promise;
  };

  /*WeePromise.defer = function(){
    return new WeePromise();
  };*/

  WeePromise.all = function( arr ){
    return new WeePromise(function( resolve , reject ){
      forEach( arr , function( promise ){
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , length( arr ))
        );
      });
    });
  };

  WeePromise.race = function( arr ){
    return new WeePromise(function( resolve , reject ){
      forEach( arr , function( promise ){
        promise[ ALWAYS ](
          checkArray( arr , resolve , reject , 1 , true )
        );
      });
    });
  };

  function getPromiseArg( context , type ){
    function setState( result ){
      if (!context[_READY]) {
        setTimeout(function(){
          setState( result );
        });
      }
      else {
        if (!context[_STATE]) {
          context
            [ _EXEC ]( type , result )
            [ _EXEC ]( _ALWAYS , result );
        }
      }
    }
    return setState;
  }

  function checkArray( arr , resolve , reject , test , single ){
    return function(){
      arr = arr.map(function( promise , i ){
        return isThenable( promise[_RESULT] ) ? promise[_RESULT] : promise;
      });
      var resolved = filter( arr , RESOLVED );
      var rejected = filter( arr , REJECTED );
      if (length( resolved ) == test) {
        var result = resolved.map(function( promise ){
          return promise[_RESULT][0];
        });
        resolve( single ? result[0] : result );
      }
      else if (length( rejected ) > 0) {
        reject(
          rejected[0][_RESULT][0]
        );
      }
    };
  }

  function isHandled( subject ){
    return length(subject[ _CATCH ]) > 0;
  }

  function filter( arr , testState ){
    return arr.filter(function( promise ){
      return (/*!isThenable( promise ) ||*/ (promise[_STATE] === testState));
    });
  }

  function isThenable( subject ){
    return !!(subject && subject[THEN] && subject[CATCH]);
  }

  function trycatch( context , func ){
    try {
      return func();
    }
    catch( err ) {
      return context[ _EXEC ]( _CATCH , err );
    }
  }

  function length( subject ){
    return subject.length;
  }

  function forEach( subject , callback ){
    subject.forEach( callback );
  }

  return WeePromise;  
}( setTimeout )));
