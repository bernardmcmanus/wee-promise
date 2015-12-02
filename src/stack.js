var Stack$id = 0;

function Stack(){
  var queue = [],
    length = 0,
    index = 0,
    id = Stack$id++,
    that = {
      queue: queue,
      get length(){
        return length;
      },
      get index(){
        return index;
      },
      push: function( type , func ){
        if (func) {
          queue[length] = { type: type, func: func };
          length++;
        }
        // console.log(this);
      },
      pull: function(){
        var arg = queue[index];
        queue[index] = UNDEFINED;
        index++;
        /*if (index == length) {
          queue.length = index = length = 0;
        }*/
        return arg;
      },
      next: function( type ){
        var i = index, element;
        while (i < length) {
          // console.warn('%s: %s',id,i);
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
