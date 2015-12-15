function Stack(){
  var that = this;
  that.q = [];
  that.i = 0;
  that.len = 0;
}

Stack.prototype.put = function( element ){
  var that = this;
  that.q[that.len] = element;
  that.len++;
};

Stack.prototype.get = function(){
  var that = this,
    element = that.q[that.i];
    that.i++;
    if (that.i >= that.len) {
      that.q.length = that.i = that.len = 0;
    }
    return element;
};
