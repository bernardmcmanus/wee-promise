module.exports = function( grunt ) {

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    gitinfo: {},

    jshint: {
      all: '<%= pkg.config.src %>'
    },

    clean: {
      all: [ 'dist' ]
    },

    replace: [{
      options: {
        patterns: [{
          match: /(.*"version"\:\s*).*(?=,)/i,
          replacement: '$1"<%= pkg.version %>"'
        }]
      },
      files: [{
        src: 'bower.json',
        dest: 'bower.json'
      }]
    }],

    'release-describe': {
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    concat: {
      options: {
        banner: '<%= pkg.config.banner %>\n'
      },
      dist: {
        src: [ '<%= pkg.config.lib %>' , '<%= pkg.config.src %>' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= pkg.config.banner %>'
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    watch: {
      debug: {
        files: [ '<%= pkg.config.src %>' , 'test/*' ],
        options: { interrupt: true },
        tasks: [ 'build' , 'mocha_phantomjs' ]
      },
    },

    connect: {
      server: {
        options: {
          port: '<%= pkg.config.connect.port %>',
          base: '<%= pkg.config.connect.base %>',
          hostname: '<%= pkg.config.connect.hostname %>'
        }
      }
    },

    mocha_phantomjs: {
      test: {
        options: { urls: [
          '<%= pkg.config.connect.url %>/test/index.html'
        ]}
      }
    }
  });

  grunt.loadTasks( 'tasks' );

  [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-gitinfo',
    'grunt-replace',
    'grunt-contrib-watch',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'build',
    'test',
    'replace',
    'release-describe'
  ]);

  grunt.registerTask( 'build' , [
    'clean',
    'jshint',
    'gitinfo',
    'concat',
    'uglify'
  ]);

  grunt.registerTask( 'test' , [
    'connect',
    'mocha_phantomjs'
  ]);

  grunt.registerTask( 'debug' , [
    'build',
    'connect',
    'watch'
  ]);
};
