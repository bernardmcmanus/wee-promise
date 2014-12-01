(function() {


  var httpd = require( 'httpd-node' );

  httpd.environ( 'root' , '/Users/bmcmanus/wee-promise' );

  var server = new httpd()
    .dir( 'default' , '/' )
    .environ( 'profile' , 'dev' )
    .rewrite({
      pattern: /^\/$/i,
      handle: function( req , res , match ) {
        return '/test/httpd/index.html';
      }
    })
    .rewrite({
      pattern: /^\/cloud\.png$/i,
      handle: function( req , res , match ) {
        return '/test/httpd/cloud.png';
      }
    })
    .rewrite({
      pattern: /^\/wee-promise\.js$/i,
      handle: function( req , res , match ) {
        return '/index.js';
      }
    })
    .rewrite({
      pattern: /^\/test\.js$/i,
      handle: function( req , res , match ) {
        return '/test/httpd/test.js';
      }
    })
    .rewrite({
      pattern: /^\/recursive-load\.js$/i,
      handle: function( req , res , match ) {
        return '/test/httpd/recursive-load.js';
      }
    })
    .rewrite({
      pattern: /^\/es6-promise\.js$/i,
      handle: function( req , res , match ) {
        return '/node_modules/es6-promise/dist/es6-promise.js';
      }
    })
    .start();


}());




























