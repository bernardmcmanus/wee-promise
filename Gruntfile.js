module.exports = function( grunt ) {

  var fs = require( 'fs' );
  var cp = require( 'child_process' );
  var colors = require( 'colors' );

  var src = [
    'node_modules/briskit/dist/briskit.js',
    'index.js'
  ];

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    'git-describe': {
      'options': {
        prop: 'git-version'
      },
      dist: {}
    },

    jshint: {
      all: [ 'index.js' ]
    },

    clean: {
      all: [ 'dist' ]
    },

    replace: [{
      options: {
        patterns: [
          {
            match: /\"version\".*?\".*\"/i,
            replacement: '\"version\": \"<%= pkg.version %>\"'
          }
        ]
      },
      files: [
        {
          src: 'package.json',
          dest: 'package.json'
        },
        {
          src: 'bower.json',
          dest: 'bower.json'
        }
      ]
    }],

    'release-describe': {
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.get( \'git-branch\' ) %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
      },
      release: {
        src: src,
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.get( \'git-branch\' ) %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      release: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    watch: {
      debug: {
        files: [ '*.js' , 'test/*' ],
        options: { interrupt: true },
        tasks: [ 'clean' , 'concat' , 'mocha_phantomjs' ]
      },
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: '.',
          hostname: '0.0.0.0',
        }
      }
    },

    mocha_phantomjs: {
      test: {
        options: { urls: [
          '/test/index.html'
        ]}
      }
    }
  });

  grunt.loadTasks( 'tasks' );

  [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-git-describe',
    'grunt-replace',
    'grunt-contrib-watch',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'git:hash' , function() {
    grunt.task.requires( 'git-describe' );
    var rev = grunt.config.get( 'git-version' );
    var matches = rev.match( /(\-{0,1})+([A-Za-z0-9]{7})+(\-{0,1})/ );
    var hash = matches
      .filter(function( match ) {
        return match.length === 7;
      })
      .pop();
    if (matches && matches.length > 1) {
      grunt.config.set( 'git-hash' , hash );
    }
    else{
      grunt.config.set( 'git-hash' , rev );
    }
  });

  grunt.registerTask( 'git:branch' , function() {
    var done = this.async();
    cp.exec( 'git status' , function( err , stdout , stderr ) {
      if (!err) {
        var branch = stdout
          .split( '\n' )
          .shift()
          .replace( /on\sbranch\s/i , '' );
        grunt.config.set( 'git-branch' , branch );
      }
      done();
    });
  });

  /*grunt.registerTask( 'test' , function() {
    var done = this.async();
    new Promise(function( resolve ) {
      var task = cp.spawn( 'npm' , [ 'test' ]);
      resolve( task.stdout );
    })
    .then(function( readable ) {
      readable.pipe( process.stdout );
      return new Promise(function( resolve , reject ) {
        readable.on( 'end' , resolve );
        readable.on( 'error' , reject );
      });
    })
    .then( done )
    .catch( grunt.fail.fatal );
  });*/

  grunt.registerTask( 'always' , [
    'jshint',
    'clean',
    'git-describe',
    'git:hash',
    'git:branch'
  ]);

  grunt.registerTask( 'debug' , [
    'clean',
    'concat',
    'test',
    'watch'
  ]);

  grunt.registerTask( 'test' , [
    'connect',
    'mocha_phantomjs'
  ]);

  grunt.registerTask( 'default' , [
    'always',
    'concat',
    'uglify',
    'test',
    'replace',
    'release-describe'
  ]);
};
