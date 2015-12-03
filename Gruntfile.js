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
    wrap: {
      options: {
        args: (function(){
          var args = [
            'setTimeout',
            'TypeError',
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
      dist: {
        files: { 'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js' }
      }
    },
    concat: {
      tmp: {
        files: { 'dist/<%= pkg.name %>.js': '<%= pkg.config.src %>' }
      },
      dist: {
        options: { banner: '<%= pkg.config.banner %>\n' },
        files: { 'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js' }
      }
    },
    uglify: {
      dist: {
        options: { banner: '<%= pkg.config.banner %>' },
        files: { 'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js' }
      }
    },
    watch: {
      options: { interrupt: true },
      all: {
        files: '<%= pkg.config.src %>',
        tasks: [ 'build' , 'test' ]
      }
    },
    'release-describe': {
      dist: {
        files: { 'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js' }
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
    'grunt-wrap',
    'grunt-gitinfo'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'build',
    'test',
    'update_json',
    'uglify',
    'release-describe'
  ]);

  grunt.registerTask( 'build' , [
    'clean',
    'gitinfo',
    'concat:tmp',
    'wrap',
    'concat:dist'
  ]);

  grunt.registerTask( 'test' , function(){
    try {
      grunt.task.requires( 'build' );
    }
    catch( err ){
      grunt.task.run( 'build' );
    }
    grunt.task.run( 'a-plus' );
  });

  grunt.registerTask( 'debug' , [
    'test',
    'watch'
  ]);
};
