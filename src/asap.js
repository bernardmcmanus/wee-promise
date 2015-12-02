function asap( cb ){
  var img = new Image();
  img.onerror = function(){ cb() };
  img.src = '';
}
