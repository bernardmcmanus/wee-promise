var fs = require('fs');
var cp = require('child_process');
var Intercept = require('intercept-stdout');
var transpiler = require( 'es6-module-transpiler' );

var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;
var BundleFormatter = transpiler.formatters.bundle;

module.exports = function(grunt) {
	// Clean up HTTP errors encountered during tests
	Intercept(function(text) {
		if (Buffer.isBuffer(text)) {
			text = text.toString('utf-8');
		}
		if ((/Error loading resource/i).test(text)) {
			return '';
		}
	});

	// always print a stack trace if something goes wrong
	grunt.option('stack', true);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		gitinfo: {},
		jshint: {
			all: ['src/*'],
			options: {
				esnext: true
			}
		},
		clean: {
			compiled: ['tmp', 'compiled'],
			dist: ['dist']
		},
		modules: {
			src: '../tmp/export',
			dest: './compiled/<%= pkg.name %>.js',
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
					src: '*.js',
					dest: 'dist/',
					cwd: 'compiled/'
				}]
			}
		},
		watch: {
			options: { interrupt: true },
			all: {
				files: 'src/*',
				tasks: ['build', '_test']
			}
		},
		connect: {
			server: {
				options: {
					port: '<%= pkg.config.connect.port %>',
					base: '<%= pkg.config.connect.base %>',
					hostname: '<%= pkg.config.connect.hostname %>',
					interrupt: true,
					middleware: function(connect, options, middlewares) {
						var Preprocessor = require('connect-preprocess');
						var Router = require('urlrouter');
						var Query = require('connect-query');
						var parseUrl = require('url').parse;
						grunt.config.set('query', '{}');
						return [
							Query(),
							Router(function(app) {
								app.get('/test/(unit|functional)\/?$', function(req, res, next) {
									var type = parseUrl(req.url).pathname.match(/\/test\/([^\/]+)/i)[1];
									req.url = '/test/index.html';
									grunt.config.set('test_src', '/test/' + type + '.js');
									grunt.config.set('query', JSON.stringify(req.query));
									next();
								});
							}),
							Preprocessor({
								accept: ['html'],
								engine: grunt.config.process
							})
						]
						.concat(middlewares);
					}
				}
			}
		},
		mocha_phantomjs: {
			test: {
				options: {
					urls: [
						'http://localhost:<%= pkg.config.connect.port %>/test/unit',
						'http://localhost:<%= pkg.config.connect.port %>/test/functional'
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

	grunt.loadTasks('tasks');

	[
		'grunt-contrib-jshint',
		'grunt-contrib-clean',
		'grunt-contrib-uglify',
		'grunt-contrib-watch',
		'grunt-contrib-connect',
		'grunt-mocha-phantomjs',
		'grunt-gitinfo',
		'grunt-contrib-copy'
	]
	.forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', [
		'build',
		'uglify',
		'clean:dist',
		'copy',
		'clean:compiled',
		'release-describe'
	]);

	grunt.registerTask('build', [
		'clean:compiled',
		'jshint',
		'gitinfo',
		'babel',
		'modules'
	]);

	grunt.registerTask('test', [
		'connect',
		'_test'
	]);

	grunt.registerTask('debug', [
		'test',
		'watch'
	]);

	grunt.registerTask('babel', function() {
		var buffer = cp.execSync('./node_modules/.bin/babel src --out-dir tmp --source-maps inline');
		process.stdout.write(buffer.toString('utf-8'));
	});

	grunt.registerTask('modules', function() {
		var src = grunt.config.get('modules.src');
		var dest = grunt.config.get('modules.dest');
		var container = new Container({
			resolvers: [new FileResolver(['src/'])],
			formatter: new BundleFormatter()
		});

		container.getModule(src);
		container.write(dest);

		var transpiled = fs
			.readFileSync(dest, 'utf-8')
			.replace(/(^.*sourceMappingURL.*\n?$)/mi, '')
			.replace(/([\s\t]+)("use strict";)/, '$1$2$1var global = this;');

		fs.writeFileSync(dest, transpiled);
	});

	grunt.registerTask('_test', function() {
		try {
			grunt.task.requires('build');
		}
		catch(err) {
			grunt.task.run('build');
		}
		grunt.task.run(['mocha_phantomjs', 'a-plus']);
	});
};
