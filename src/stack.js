var Stack = (function( UNDEFINED ){
  var queue = [],
    length = 0,
    index = 0;
  return {
    push: function( arg ){
      queue[length] = arg;
      length++;
    },
    pull: function(){
      var arg = queue[index];
      queue[index] = UNDEFINED;
      index++;
      return arg;
    }
  };
}());
