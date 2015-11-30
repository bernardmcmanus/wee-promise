module.exports = function( grunt ) {
  // Clean up HTTP errors encountered during tests
  require( 'intercept-stdout' )(function( text ){
    if (Buffer.isBuffer( text )) {
      text = text.toString( 'utf-8' );
    }
    if ((/Error loading resource/i).test( text )) {
      return '';
    }
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    gitinfo: {},
    jshint: {
      all: [ '<%= pkg.config.src %>' ]
    },
    clean: {
      all: [ 'dist' ]
    },
    update_json: {
      options: {
        src: 'package.json',
        indent: 2
      },
      bower: {
        dest: 'bower.json',
        fields: [
          'name',
          'version',
          'main',
          'description',
          'keywords',
          'homepage',
          'license'
        ]
      }
    },
    concat: {
      options: {
        banner: '<%= pkg.config.banner %>\n',
        stripBanners: {
          options: { block: true }
        }
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': '<%= pkg.config.src %>'
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= pkg.config.banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': '<%= pkg.config.src %>'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: '<%= pkg.config.connect.port %>',
          base: '<%= pkg.config.connect.base %>',
          hostname: '<%= pkg.config.connect.hostname %>',
          interrupt: true,
          middleware: function( connect , options , middlewares ){
            var Preprocessor = require( 'connect-preprocess' );
            var Query = require( 'connect-query' );
            grunt.config.set( 'query' , '{}' );
            return [
              Query(),
              function( req , res , next ){
                if (Object.keys( req.query ).length) {
                  grunt.config.set( 'query' , JSON.stringify( req.query ));
                }
                next();
              },
              Preprocessor({
                accept: [ 'html' ],
                engine: grunt.config.process
              })
            ]
            .concat( middlewares );
          }
        }
      }
    },
    mocha_phantomjs: {
      dist: {
        options: {
          urls: [
            'http://localhost:<%= pkg.config.connect.port %>/test/index.html?test=unit',
            'http://localhost:<%= pkg.config.connect.port %>/test/index.html?test=functional'
          ]
        }
      }
    },
    'release-describe': {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
        }
      }
    }
  });

  grunt.loadTasks( 'tasks' );

  [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs',
    'grunt-update-json',
    'grunt-gitinfo'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'build',
    'test',
    'update_json',
    'release-describe'
  ]);

  grunt.registerTask( 'build' , [
    'clean',
    'gitinfo',
    'concat',
    'uglify'
  ]);

  grunt.registerTask( 'test' , [
    'connect',
    'mocha_phantomjs'
  ]);

  grunt.registerTask( 'debug' , function(){
    grunt.config.set( 'connect.server.options.keepalive' , true );
    grunt.task.run( 'connect' );
  });
};
