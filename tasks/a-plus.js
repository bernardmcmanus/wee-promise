module.exports = function( grunt ) {
	var promisesAplusTests = require( 'promises-aplus-tests' );
	grunt.registerTask( 'a-plus' , function(){
		var adapter = require( '../test/adapter' );
		var done = this.async();
		promisesAplusTests( adapter , done );
	});
};
