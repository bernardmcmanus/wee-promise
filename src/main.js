var PROTOTYPE = 'prototype';
// var RESOLVE = 'resolve';
// var REJECT = 'reject';
// var ALWAYS = 'always';
var THEN = 'then';
var CATCH = 'catch';
// var PENDING = UNDEFINED;
var RESOLVED = 1;
var REJECTED = 2;
// var _PASS = '_pass';
var _STATE = '_state';
var _RESULT = '_result';
/*var _ALWAYS = '_' + ALWAYS;
var _THEN = '_' + THEN;
var _CATCH = '_' + CATCH;*/
// var _QUEUE = '_queue';
var _ADD = '_add';
var _EXEC = '_exec';
// var _READY = '_ready';
// var _CHILD = '_child';
// var _HANDLED = '_handled';
// var _HANDLED_SELF = _HANDLED + 'Self';

var STATEMAP = {};
/*STATEMAP[_THEN] = RESOLVED;
STATEMAP[_CATCH] = REJECTED;*/
STATEMAP[THEN] = RESOLVED;
STATEMAP[CATCH] = REJECTED;

function WeePromise( resolver ){
  var that = this;
  // that[_STATE] = PENDING;
  // that[_RESULT] = [];
  // that[_READY] = false;
  // that[_HANDLED] = false;
  // that[_HANDLED_SELF] = false;
  // that[_CHILD] = false;
  /*forEach([ _THEN , _CATCH , _ALWAYS ], function( key ){
    that[key] = [];
  });*/
  
  that.queue = Stack();
  // that.result = [];
  that.inprog = false;

  /*that[RESOLVE] = getPromiseArg( that , _THEN );
  that[REJECT] = getPromiseArg( that , _CATCH );*/
  /*that.resolve = getPromiseArg( that , THEN );
  that.reject = getPromiseArg( that , CATCH );*/

  that.resolve = function( result ){
    if (!that._state) {
      // that.result[0] = result;
      // that._state = RESOLVED;
      // that.setState( RESOLVED );
      that._exec( THEN , result );
    }
    return that;
  };
  that.reject = function( result ){
    if (!that._state) {
      // that.result[0] = result;
      // that._state = REJECTED;
      // that.setState( REJECTED );
      that._exec( CATCH , result );
    }
    return that;
  };
  
  asap(function(){
    if (resolver) {
      /*trycatch( that , function(){
        resolver( that.resolve , that.reject );
      });*/
      try {
        resolver( that.resolve , that.reject );
      }
      catch( err ){
        that.reject( err );
      }
    }
  });
}

WeePromise[ PROTOTYPE ][ _ADD ] = function( type , func ){
  var that = this;
  that.queue.push( type , func );
  /*switch (that._state) {
    case RESOLVED:
      return that._exec()
  }
  return that;*/
  return STATEMAP[type] == that._state && !that.inprog ? that._exec( type , that.result ) : that;
};

/*WeePromise[ PROTOTYPE ].setState = function( state ){
  this._state = state;
};*/

// var safe = 0;

WeePromise[ PROTOTYPE ][ _EXEC ] = function( type , result ){
  var that = this, func;
  // if (safe >= 100) return;
  // safe++;

  function handleThenable( result ){
    result.then(function( $result ){
      that._exec( THEN , $result );
    });
    return that;
  }

  that.inprog = true;

  try {
    switch (type) {
      case THEN:
        while (func = that.queue.next( type )) {
          result = func.call( UNDEFINED , result );
          if (isThenable( result )) {
            return handleThenable( result );
          }
        }
        // that.setState( RESOLVED );
        that._state = RESOLVED;
        that.result = result;
      break;
      case CATCH:
        func = that.queue.next( type );
        if (func) {
          result = func.call( UNDEFINED , result );
          if (isThenable( result )) {
            return handleThenable( result );
          }
          return that._exec( THEN , result );
        }
        that._state = REJECTED;
        // that.setState( REJECTED );
      break;
    }
  }
  catch( err ) {
    return that._exec( CATCH , err );
  }
  that.inprog = false;
  return that;
};

/*WeePromise[ PROTOTYPE ][ _EXEC ] = function( type , result ){
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
};*/

/*WeePromise[ PROTOTYPE ][ ALWAYS ] = function( func ){
  // return this[ _ADD ]( _ALWAYS , func );
  return this[ _ADD ]( ALWAYS , func );
};*/

WeePromise[ PROTOTYPE ][ THEN ] = function( onresolve , onreject ){
  return this
    // [ _ADD ]( _THEN , onresolve )
    [ _ADD ]( THEN , onresolve )
    [CATCH]( onreject );
};

WeePromise[ PROTOTYPE ][ CATCH ] = function( func ){
  // return this[ _ADD ]( _CATCH , func );
  return this[ _ADD ]( CATCH , func );
};

/*WeePromise[ PROTOTYPE ][ _PASS ] = function( promise ){
  var that = this;
  promise[_HANDLED_SELF] = isHandled( promise );
  promise[_CHILD] = true;
  forEach([ _THEN , _CATCH , _ALWAYS ], function( key ){
    promise[key] = (promise[_HANDLED_SELF] ? promise[key].concat( that[key] ) : that[key]);
  });
  that[_RESULT] = promise;
  return promise;
};*/

WeePromise.resolve = function( result ){
  return new WeePromise().resolve( result );
  /*var promise = new WeePromise();
  promise.resolve( result );
  return promise;*/
};

WeePromise.reject = function( reason ){
  return new WeePromise().reject( reason );
  /*var promise = new WeePromise();
  promise.reject( reason );
  return promise;*/
};

WeePromise.all = function( arr ){
  var promise = new WeePromise();
  // var result = Array( arr.length );
  var result = [], got = 0, need = arr.length;
  arr.forEach(function( child , i ){
    console.log(child);
    if (isThenable( child )) {
      child.then(function( child$result ){
        result[i] = child$result;
        got++;
        if (got == need) {
          promise.resolve( result );
        }
      });
      child.catch(function( child$reason ){
        promise.reject( child$reason );
      });
    }
    else {
      got++;
      result[i] = child;
    }
  });
  return promise;
};

function isThenable( subject ){
  return !!(subject && subject[THEN]);
}

/*WeePromise.defer = function(){
  return new WeePromise();
};*/

/*WeePromise.all = function( arr ){
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
};*/

// function getPromiseArg( context , type ){
//   function setState( result ){
//     if (!context[_READY]) {
//       setTimeout(function(){
//         setState( result );
//       });
//     }
//     else {
//       if (!context[_STATE]) {
//         context
//           [ _EXEC ]( type , result )
//           // [ _EXEC ]( _ALWAYS , result );
//           [ _EXEC ]( ALWAYS , result );
//       }
//     }
//   }
//   return setState;
// }

/*function checkArray( arr , resolve , reject , test , single ){
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
}*/

/*function isHandled( subject ){
  return length(subject[ _CATCH ]) > 0;
}*/

// function filter( arr , testState ){
//   return arr.filter(function( promise ){
//     return (/*!isThenable( promise ) ||*/ (promise[_STATE] === testState));
//   });
// }

/*function trycatch( context , func ){
  try {
    return func();
  }
  catch( err ) {
    return context[ _EXEC ]( CATCH , err );
  }
}

function length( subject ){
  return subject.length;
}

function forEach( subject , callback ){
  subject.forEach( callback );
}*/
