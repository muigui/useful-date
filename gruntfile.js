module.exports = function( grunt ) {
	var exec = require( 'child_process' ).exec;

	grunt.initConfig( {
		concat        : {
			options   : { separator : ';\n' },
			dist      : {
				src   : [
					'./src/vars.js',    './src/utils.js',   './src/coerce.js',     './src/diff.js',
					'./src/fns.js',     './src/format.js',  './src/lexicalize.js', './src/localize.js',
					'./src/filters.js', './src/formats.js', './src/parsers.js',    './src/expose.js'
				],
				dest  : './index.js'
			}
		},
		uglify        : {
			my_target : {
				files : {
					'./build/build.min.js' : [
						'./build/build.js'
					]
				}
			}
		},
		watch         : {
			files     : ['./src/**/*.js', './test/**/*.js'],
			tasks     : ['default']
		}
	} );

  	grunt.loadNpmTasks( 'grunt-contrib-concat' );
  	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	grunt.registerTask( 'component:build', 'run component.io build script', function() {
		console.log( 'component:build start.' );

		var done = this.async();

		exec( 'component build', function( error, stdout, stderr ) {
			!stdout || console.log( stdout );
			!stderr || console.log( 'ERROR: ' + stderr );

			 console.log( error !== null ? 'EXEC ERROR: ' + error : 'component:build complete.' );

			 done();
		} );
  	} );

  	grunt.registerTask( 'default', ['concat', 'component:build', 'uglify'] );
};
