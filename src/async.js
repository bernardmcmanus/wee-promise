var asyncProvider;

if (global.setImmediate) {
  asyncProvider = setImmediate;
}
else if (global.MessageChannel) {
  asyncProvider = function( cb ){
    var channel = new MessageChannel();
    channel.port1.onmessage = cb;
    channel.port2.postMessage( 0 );
  };
}
else {
  asyncProvider = setTimeout;
}

WeePromise.async = function( cb ){
  asyncProvider( cb );
};
