window.WeePromise = (function( Array , briskit ) {

  'use strict';

  var UNDEFINED;

  function Promise( resolver ) {

    var that = this;

    that.$state = 0;
    that.$stack = [];
    that.$watchers = [];
    that.$onStateChange = [];
    that.$args = [];

    briskit(function() {
      var args = trycatch( that , function() {
        resolver(
          getPromiseArg( that , 1 ),
          getPromiseArg( that , -1 )
        );
      });
      that._args( args );
      if (that.$state < 0) {
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
    _setState: function( state ) {
      var that = this;
      that.$state = state;
      that.$onStateChange.forEach(function( func ) {
        func();
      });
    },
    _args: function( arg , index ) {
      var that = this;
      var $args = that.$args;
      if (arg != UNDEFINED) {
        $args[ index || 0 ] = arg;
      }
      return length( $args ) > 1 ? $args : $args[0];
    },
    _watch: function( notifiers , until , done ) {
      var that = this;
      notifiers = ensureArray( notifiers ).slice( 0 );
      notifiers.forEach(function( notifier , i ) {
        function onStateChange() {
          var index = notifiers.indexOf( notifier );
          notifiers.splice( index , 1 );
          that._args( notifier._args() , i );
          if (length( notifiers ) == until) {
            done();
          }
        }
        briskit(function() {
          if (notifier.$state) {
            onStateChange();
          }
          else {
            notifier.$watchers.push( that );
            notifier.$onStateChange.push( onStateChange );
          }
        });
      });
      return that;
    },
    __enqueue: function( block ) {
      this.$stack.push( block );
      return this;
    },
    __flush: function() {
      var that = this;
      var block = getNextOfState( that.$stack , that.$state );
      var result;
      if (block) {
        result = trycatch( that , block.func );
        if (is( result , Promise )) {
          that._watch( result , 0 , function() {
            // console.log(result);
            that.__flush();
          });
        }
        else {
          /*if (result != UNDEFINED) {
            console.log(result);
          }*/
          // that._args = result;
          // debugger;
          that._args( result );
          that.__flush();
        }
      }
      /*else {
        debugger;
        that._args = length( that._args ) > 1 ? flattenArray( that._args ) : that._args[0];
      }*/
    }
  };

  Promise.all = function( arr ) {
    var p = new Promise(function( resolve , reject ) {
      p._watch( arr , 0 , function() {
        // debugger;
        // console.log(p);
        /*if (arr.length == 3) {
          debugger;
        }*/
        var stackLength = arr.reduce(function( prev , current ) {
          return prev + current.$stack.length;
        },0);
        console.log(/*stackLength*/p._args());
        resolve();
      });
    });
    return p;
  };

  function getPromiseArg( context , state ) {
    return function( args ) {
      if (!context.$state) {
        context._args( args );
        context._setState( state );
        context.__flush();
      }
    };
  }

  function trycatch( context , func ) {
    try {
      return func( context._args() );
    }
    catch ( err ) {
      // console.error( err.stack );
      // context._state = -1;
      context._setState( -1 );
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

  /*function flattenArray( arr ) {
    return arr.reduce(function( prev , current ) {
      return prev.concat( current );
    },[]);
  }*/

  function ensureArray( subject ) {
    return (Array.isArray( subject ) ? subject : ( subject !== UNDEFINED ? [ subject ] : [] ));
    // return Array.isArray( subject ) ? subject : [ subject ];
  }

  /*function forEach( subject , callback ) {
    subject.forEach( callback );
  }*/

  return Promise;









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
  
}( Array , briskit ));
