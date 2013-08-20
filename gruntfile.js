module.exports = function( grunt ) {
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
		}
	} );

  	grunt.loadNpmTasks( 'grunt-contrib-concat' );

  	grunt.registerTask( 'default', ['concat'] );
};
