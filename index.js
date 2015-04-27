window.WeePromise = (function( briskit ) {

  'use strict';

  var UNDEFINED;
  // var PROTOTYPE = 'prototype';
  /*var ALWAYS = 'always';
  var THEN = 'then';
  var CATCH = 'catch';
  var _PASS = '$$pass';
  var _STATE = '$$state';
  var _ARGS = '$$args';
  var _ALWAYS = '$$' + ALWAYS;
  var _THEN = '$$' + THEN;
  var _CATCH = '$$' + CATCH;
  var _ADD = '$$add';
  var _EXEC = '$$exec';
  var _READY = '$$ready';
  var _CHILD = '$$child';
  var _HANDLED = '$$handled';
  var _HANDLED_SELF = _HANDLED + 'Self';*/

  /*var STATEMAP = {};
  STATEMAP['$$then'] = 1;
  STATEMAP['$$catch'] = -1;*/

  function Promise( resolver ) {

    var that = this;
    // var args;

    that._state = 0;
    that._queue = [];
    that._watchers = [];
    that._args = UNDEFINED;
    /*Object.defineProperty( that , '_args' , {
      get: function() {
        return args;
      },
      set: function( val ) {
        if (val != UNDEFINED) {
          args = val;
          // args = [ val ];
        }
      }
    });*/

    briskit(function() {
      that._args = trycatch( that , function() {
        resolver(
          getPromiseArg( that , 1 ),
          getPromiseArg( that , -1 )
        );
      });
      if (that._state < 0) {
        that.__flush();
      }
    });
  }

  Promise.prototype = {
    then: function( func ) {
      return this.__enqueue({ state: 1, func: func });
    },
    catch: function( func ) {
      return this.__enqueue({ state: -1, func: func });
    },
    /*_setState: function( state , args ) {
      var that = this;
      if (state != UNDEFINED) {
        that._state = state
      }
      that._args = args;
    },*/
    _watch: function( notifier ) {
      notifier._watchers.push( this );
    },
    _notify: function() {
      var that = this;
      var watchers = that._watchers;
      var watcher;
      while (length( watchers )) {
        watcher = watchers.shift();
        watcher._args = that._args;
        watcher.__flush();
      }
      /*var watchers = that._watchers;
      forEach( watchers , function( watcher ) {
        // console.log(watcher);
        watcher._args = that._args;
        watcher.__flush();
      });*/
    },
    __enqueue: function( block ) {
      this._queue.push( block );
      return this;
    },
    __flush: function() {
      var that = this;
      var block = getNextOfState( that._queue , that._state );
      var result;
      // console.log(block);
      // console.log(that._args);
      if (block) {
        result = trycatch( that , block.func );
        if (is( result , Promise )) {
          that._watch( result );
        }
        else {
          that._args = result;
          that.__flush();
        }
      }
      else {
        that._notify();
      }
    }
  };

  function getPromiseArg( context , state ) {
    return function( args ) {
      // briskit(function() {
        if (!context._state) {
          context._args = args;
          context._state = state;
          context.__flush();
        }
      // });
    };
  }

  function trycatch( context , func ) {
    try {
      return func( context._args );
    }
    catch ( err ) {
      // console.error( err.stack );
      context._state = -1;
      return err;
    }
  }

  function getNextOfState( queue , state ) {
    var block;
    while (length( queue )) {
      block = queue.shift();
      if (block.state == state) {
        return block;
      }
    }
  }

  function is( subject , test ) {
    return subject instanceof test;
  }

  function length( subject ) {
    return subject.length;
  }

  /*function forEach( subject , callback ) {
    subject.forEach( callback );
  }*/

  return Promise;

  /*Promise[ PROTOTYPE ][ _ADD ] = function( type , func ) {
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

  Promise[ PROTOTYPE ][ _PASS ] = function( promise ) {
    
    var that = this;
    
    promise[_HANDLED_SELF] = isHandled( promise );
    promise[_CHILD] = true;

    forEach([ _THEN , _CATCH , _ALWAYS ] , function( key ) {
      promise[key] = (promise[_HANDLED_SELF] ? promise[key].concat( that[key] ) : that[key]);
    });

    that[_ARGS] = promise;

    return promise;
  };*/

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
    return subject instanceof Promise;
  }
  
}( briskit ));
