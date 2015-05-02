/*! wee-promise - 0.3.0 - Bernard McManus -  -  - 2015-05-02 */

/*! briskit - 0.2.0 - Bernard McManus - 5913d2b - 2015-04-26 */

(function(Array,setTimeout,$UNDEFINED) {
    "use strict";
    var static$$$global = (typeof global != '' + $UNDEFINED ? global : window);
    function async$$chooseProvider() {
      if (async$$setImmediate) {
        providers$$setProvider( providers$$nextTick );
      }
      else if (async$$MutationObserver) {
        providers$$setProvider( providers$$observer );
      }
      else if (async$$MessageChannel) {
        providers$$setProvider( providers$$worker );
      }
      else {
        providers$$setProvider( providers$$timeout );
      }
    }

    var async$$setImmediate = (function() {
      var si = static$$$global.setImmediate;
      return si ? si : false;
    }());

    var async$$MutationObserver = (function() {
      var m = static$$$global.MutationObserver;
      return m ? m : false;
    }());

    var async$$MessageChannel = (function() {
      // don't use worker if this is IE10
      var channel = static$$$global.MessageChannel;
      var Uint8ClampedArray = static$$$global.Uint8ClampedArray;
      return Uint8ClampedArray && channel ? channel : false;
    }());

    var providers$$async$provider;

    var providers$$default = {
      nextTick: providers$$nextTick,
      observer: providers$$observer,
      worker: providers$$worker,
      timeout: providers$$timeout
    };

    function providers$$getProvider() {
      return providers$$async$provider( stack$$flush );
    }

    function providers$$setProvider( provider ) {
      if (provider) {
        providers$$async$provider = provider;
      }
      else {
        async$$chooseProvider();
      }
    }

    function providers$$nextTick( cb ) {
      return function() {
        setImmediate( cb );
      };
    }

    function providers$$observer( cb ) {
      var iterations = 0;
      var m = new MutationObserver( cb );
      var node = document.createTextNode( '' );
      m.observe( node , { characterData: true });
      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function providers$$worker( cb ) {
      var channel = new MessageChannel();
      channel.port1.onmessage = cb;
      return function() {
        channel.port2.postMessage( 0 );
      };
    }

    function providers$$timeout( cb ) {
      return function() {
        setTimeout( cb , 1 );
      };
    }
    var stack$$stack = Array( 1024 );
    var stack$$length = 0;
    var stack$$errors = [];

    function stack$$scheduleTask( cb , arg ) {
      stack$$stack[stack$$length] = cb;
      stack$$stack[stack$$length+1] = arg;
      stack$$length += 2;
      if (stack$$length == 2) {
        providers$$getProvider()();
      }
    }

    var stack$$default = stack$$scheduleTask;
    function stack$$flush() {
      var cb, arg;
      for (var i = 0; i < stack$$length; i += 2) {
        cb = stack$$stack[i];
        arg = stack$$stack[i+1];
        stack$$stack[i] = $UNDEFINED;
        stack$$stack[i+1] = $UNDEFINED;
        try {
          cb( arg );
        }
        catch( err ) {
          stack$$scheduleError( err );
        }
      }
      stack$$length = 0;
    }

    function stack$$scheduleError( err ) {
      stack$$errors.push( err );
      providers$$timeout(function() {
        var err = stack$$errors.shift();
        if (err !== $UNDEFINED) {
          console.error( err.stack || err );
          throw err;
        }
      })();
    }
    stack$$default.providers = providers$$default;
    stack$$default.use = providers$$setProvider;
    providers$$setProvider();
    var $$index$$default = stack$$default;

    if (typeof exports == 'object') {
      module.exports = $$index$$default;
    }
    else {
      this.briskit = $$index$$default;
    }
}).apply(this,[Array,setTimeout]);
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
