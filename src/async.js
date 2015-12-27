var asyncProvider;

if (global.setImmediate) {
  asyncProvider = setImmediate;
}
else if (global.MessageChannel) {
  asyncProvider = (function(){
    var stack = new Stack(),
      channel = new MessageChannel();
    channel.port1.onmessage = function(){
      /* jshint -W084 */
      var fn;
      while (fn = stack.get()) {
        fn();
      }
    };
    return function( cb ){
      stack.put( cb );
      channel.port2.postMessage( 0 );
    };
  }());
}
else {
  asyncProvider = setTimeout;
}

WeePromise.async = function( cb ){
  asyncProvider( cb );
};
