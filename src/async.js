WeePromise.async = (function(){
  var _undefined = '' + UNDEFINED;
  if (typeof setImmediate != _undefined) {
    return setImmediate;
  }
  else if (typeof MessageChannel != _undefined) {
    return function( cb ){
      var channel = new MessageChannel();
      channel.port1.onmessage = function(){
        cb();
      };
      channel.port2.postMessage( 0 );
    };
  }
  return function( cb ){
    setTimeout( cb );
  };
}());
