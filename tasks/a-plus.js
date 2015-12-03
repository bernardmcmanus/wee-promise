module.exports = function( grunt ) {
  var promisesAplusTests = require( 'promises-aplus-tests' );
  var adapter = require( '../adapter' );
  grunt.registerTask( 'a-plus' , function(){
    var done = this.async();
    promisesAplusTests( adapter , done );
  });
};
