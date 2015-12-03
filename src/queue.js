function Queue(){
  var stack = [],
    length = 0,
    index = 0,
    that = {
      push: function( type , func ){
        stack[length] = { type: type, func: func };
        length++;
      },
      pull: function(){
        var arg = stack[index];
        stack[index] = UNDEFINED;
        index++;
        if (index == length) {
          stack.length = index = length = 0;
        }
        return arg;
      },
      next: function( type ){
        var i = index, element;
        while (i < length) {
          element = that.pull();
          if (element && element.type == type) {
            return element.func;
          }
          i++;
        }
      }
    };
  return that;
}
