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

  // don't strip debugging code for certain tasks
  if (process.argv.indexOf( 'test' ) > 0 || process.argv.indexOf( 'debug' ) > 0) {
    grunt.option( 'nostrip' , true );
  }

  // always print a stack trace if something goes wrong
  grunt.option( 'stack' , true );

  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    gitinfo: {},
    jshint: {
      all: [ '<%= pkg.config.src %>' ]
    },
    clean: {
      compiled: [ 'compiled' ],
      dist: [ 'dist' ]
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
    wrap: {
      options: {
        args: (function(){
          var args = [
            ['UNDEFINED']
          ];
          var leadingWrapArgs = args.map(function( arg ){
            return Array.isArray( arg ) ? arg.shift() : arg;
          })
          .filter(function( arg ){
            return !!arg;
          });
          var trailingWrapArgs = args.map(function( arg ){
            return Array.isArray( arg ) ? arg.pop() : arg;
          })
          .filter(function( arg ){
            return !!arg;
          });
          return {
            leading: leadingWrapArgs,
            trailing: trailingWrapArgs
          };
        }()),
        wrapper: [
          [
              '(function(<%= wrap.options.args.leading %>){',
                '"use strict";'
          ]
          .join('\n'),
          [
              'if (typeof exports == "object") {',
                'module.exports = WeePromise;',
              '} else {',
                'self.WeePromise = WeePromise;',
              '}',
            '}(<%= wrap.options.args.trailing %>));'
          ]
          .join('\n')
        ]
      },
      compiled: {
        files: {
          'compiled/<%= pkg.name %>.js': 'compiled/<%= pkg.name %>.js'
        }
      }
    },
    concat: {
      tmp: {
        files: {
          'compiled/<%= pkg.name %>.js': '<%= pkg.config.src %>'
        }
      },
      compiled: {
        options: { banner: '<%= pkg.config.banner %>\n' },
        files: {
          'compiled/<%= pkg.name %>.js': 'compiled/<%= pkg.name %>.js'
        }
      }
    },
    strip_code: {
      options: {
        start_comment: '{debug}',
        end_comment: '{/debug}'
      },
      compiled: {
        files: {
          'compiled/<%= pkg.name %>.js': 'compiled/<%= pkg.name %>.js'
        }
      }
    },
    uglify: {
      compiled: {
        options: { banner: '<%= pkg.config.banner %>' },
        files: {
          'compiled/<%= pkg.name %>.min.js': 'compiled/<%= pkg.name %>.js'
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          src: '*',
          dest: 'dist/',
          cwd: 'compiled/'
        }]
      }
    },
    watch: {
      options: { interrupt: true },
      all: {
        files: '<%= pkg.config.src %>',
        tasks: [ 'build' , '_test' ]
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
      test: {
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
    'grunt-contrib-watch',
    'grunt-update-json',
    'grunt-strip-code',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs',
    'grunt-wrap',
    'grunt-gitinfo',
    'grunt-contrib-copy'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'build',
    'test',
    'update_json',
    'uglify',
    'clean:dist',
    'copy',
    'clean:compiled',
    'release-describe'
  ]);

  grunt.registerTask( 'build' , [
    'clean:compiled',
    'jshint',
    'gitinfo',
    'concat:tmp',
    'wrap',
    'concat:compiled',
    'strip'
  ]);

  grunt.registerTask( 'test' , [
    'connect',
    '_test'
  ]);

  grunt.registerTask( 'debug' , [
    'test',
    'watch'
  ]);

  grunt.registerTask( '_test' , function(){
    try {
      grunt.task.requires( 'build' );
    }
    catch( err ){
      grunt.task.run( 'build' );
    }
    grunt.task.run([ 'mocha_phantomjs' , 'a-plus' ]);
  });

  grunt.registerTask( 'strip' , function(){
    if (!grunt.option( 'nostrip' )) {
      grunt.task.run( 'strip_code' );
    }
  });
};
