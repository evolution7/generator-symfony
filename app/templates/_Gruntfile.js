/**
 * Gruntfile
 * @see http://gruntjs.com/getting-started
 *
 * Plugin and task configuration for Grunt.
 *
 * Based on the yeoman webapp generator
 * @see https://github.com/yeoman/generator-webapp
 */

// Enable strict mode
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Show elapsed time at the end
    require('time-grunt')(grunt);

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Configuration
    grunt.initConfig({

        /**
         * Paths
         */
        yeoman: {
            app: 'web',
            dist: 'web/dist',
            sfApp: 'app/Resources',
            sfDist: 'app/dist/Resources'
        },

        /****************************************************************
         * Grunt Plugin Configuration
         ****************************************************************/

        /**
         * grunt-contrib-watch
         * @see https://github.com/gruntjs/grunt-contrib-watch
         *
         * Run predefined tasks whenever watched file patterns are added, changed or deleted.
         */
        watch: {<% if (cssExtension === 'compass') { %>
            compass: {
                files: ['<%%= yeoman.app %>/scss/{,*/}*.{scss,sass}'],
                tasks: ['compass:watch', 'autoprefixer']
            },<% } else { %>
            sass: {
                files: ['<%%= yeoman.app %>/scss/{,*/}*.{scss,sass}'],
                tasks: ['sass:watch', 'autoprefixer']
            },<% } %>
            livereload: {
                options: {
                    livereload: {
                        options: {
                            base: [
                                '<%%= yeoman.dist %>',
                                '<%%= yeoman.app %>'
                            ]
                        }
                    }
                },
                files: [
                    '<%%= yeoman.sfApp %>/**/*.html.twig',
                    '<%%= yeoman.app %>/css/{,*/}*.css',
                    '{<%%= yeoman.dist %>,<%%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        /**
         * grunt-contrib-connect
         * @see https://github.com/gruntjs/grunt-contrib-connect
         *
         * Start a connect web server.
         *
         * Note: this server only runs as long as grunt is running. Once grunt's tasks 
         * have completed, the web server stops. This behavior can be changed with the 
         * keepalive option, and can be enabled ad-hoc by running the task like 
         * grunt connect:keepalive
         */
        connect: {
            test: {
                options: {
                    hostname: 'localhost', // change to '0.0.0.0' for external access
                    port: 9000,
                    base: [
                        '<%%= yeoman.dist %>',
                        'test',
                        '<%%= yeoman.app %>'
                    ]
                }
            }
        },

        /**
         * grunt-contrib-clean
         * @see https://github.com/gruntjs/grunt-contrib-clean
         *
         * Clean files and folders.
         */
        clean: {
            test: '<%%= yeoman.dist %>',
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%%= yeoman.dist %>',
                        '<%%= yeoman.dist %>/*',
                        '!<%%= yeoman.dist %>/.git*'
                    ]
                }]
            }
        },

        /**
         * grunt-contrib-jshint
         * @see https://github.com/gruntjs/grunt-contrib-jshint
         *
         * Validate files with JSHint.
         */
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        /**
         * grunt-mocha
         * @see https://github.com/kmiyashiro/grunt-mocha
         *
         * Automatically run client-side mocha specs via grunt/mocha/PhantomJS.
         */
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
                }
            }
        },
        <% if (cssExtension === 'compass') { %>
        /**
         * grunt-contrib-compass
         * @see https://github.com/gruntjs/grunt-contrib-compass
         *
         * Compile Sass to CSS using Compass.
         */
        compass: {
            options: {
                sassDir: '<%%= yeoman.app %>/scss',
                cssDir: '<%%= yeoman.app %>/css',
                generatedImagesDir: '<%%= yeoman.dist %>/images/generated',
                imagesDir: '<%%= yeoman.app %>/images',
                javascriptsDir: '<%%= yeoman.app %>/scripts',
                fontsDir: '<%%= yeoman.app %>/fonts',
                importPath: '<%%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            watch: {
                options: {
                    debugInfo: true,
                    force: false
                }
            },
            dist: {
                options: {
                    debugInfo: false,
                    force: true,
                    environment: 'production'
                }
            }
        },
        <% } else { %>
        /**
         * grunt-contrib-sass
         * @see https://github.com/gruntjs/grunt-contrib-sass
         *
         * Compile Sass to CSS using Sass.
         */
        sass: {
            watch: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/scss',
                    src: ['*.scss'],
                    dest: '<%%= yeoman.app %>/css',
                    ext: '.css'
                }],
                debugInfo: true,
                lineNumbers: true,
                noCache: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/scss',
                    src: ['*.scss'],
                    dest: '<%%= yeoman.app %>/css',
                    ext: '.css'
                }],
                noCache: true
            }
        },
        <% } %>
        /**
         * grunt-autoprefixer
         * @see https://github.com/nDmitry/grunt-autoprefixer
         *
         * Parses CSS and adds vendor-prefixed CSS properties using the "Can I Use"
         * database (http://caniuse.com/).
         */
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/css/',
                    src: '{,*/}*.css',
                    dest: '<%%= yeoman.app %>/css/'
                }]
            }
        },

        /**
         * grunt-rev
         * @see https://github.com/cbas/grunt-rev
         *
         * Static file asset revisioning through content hashing
         */
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%%= yeoman.dist %>/css/{,*/}*.css',
                        '<%%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%%= yeoman.dist %>/fonts/{,*/}*.*'
                    ]
                }
            }
        },

        /**
         * grunt-usemin
         * @see https://github.com/yeoman/grunt-usemin
         *
         * Replaces references to non-optimized scripts or stylesheets
         * into a set of HTML files (or any templates/views).
         */
        useminPrepare: {
            html: '<%%= yeoman.sfApp %>/**/*.html.twig',
            options: {
                root: '<%%= yeoman.app %>',
                dest: '<%%= yeoman.dist %>/../' // This allows us to use /dist/ in the manifests
            }
        },
        usemin: {
            html: ['<%%= yeoman.sfDist %>/**/*.html.twig'],
            options: {
                assetsDirs: ['<%%= yeoman.dist %>/../']
            }
        },

        /**
         * grunt-contrib-htmlmin
         * @see https://github.com/gruntjs/grunt-contrib-htmlmin
         *
         * Minify HTML.
         */
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.sfApp %>',
                    src: '**/*.html.twig',
                    dest: '<%%= yeoman.sfDist %>'
                }]
            }
        },

        /**
         * grunt-contrib-imagemin
         * @see https://github.com/gruntjs/grunt-contrib-imagemin
         *
         * Minify PNG and JPEG images.
         */
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },

        /**
         * grunt-svgmin
         * @see https://github.com/sindresorhus/grunt-svgmin
         *
         * Minify SVG using SVGO.
         */
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },

        /**
         * grunt-contrib-copy
         * @see https://github.com/gruntjs/grunt-contrib-copy
         * 
         * Copy files and folders.
         */
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%%= yeoman.app %>',
                    dest: '<%%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'fonts/{,*/}*.*'<% if (bootstrap) { %>,
                        'bower_components/sass-bootstrap/fonts/*.*'<% } %>
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%%= yeoman.app %>/css',
                dest: '<%%= yeoman.dist %>/css/',
                src: '{,*/}*.css'
            }
        },
        
        /**
         * grunt-modernizr
         * @see https://github.com/doctyper/grunt-modernizr
         *
         * A Modernizr builder for your project. Sifts through your project files,
         * gathers up your references to Modernizr tests and outputs a lean, 
         * mean Modernizr machine.
         */
        modernizr: {
            devFile: '<%%= yeoman.app %>/bower_components/modernizr/modernizr.js',
            outputFile: '<%%= yeoman.dist %>/bower_components/modernizr/modernizr.js',
            files: [
                '<%%= yeoman.dist %>/scripts/{,*/}*.js',
                '<%%= yeoman.dist %>/css/{,*/}*.css',
                '!<%%= yeoman.dist %>/scripts/vendor/*'
            ],
            uglify: true
        },
        
        /**
         * grunt-concurrent
         * @see https://github.com/sindresorhus/grunt-concurrent
         *
         * Running slow tasks like Coffee and Sass concurrently can potentially 
         * improve your build time significantly. This task is also useful if 
         * you need to run multiple blocking tasks like nodemon and watch at once.
         */
        concurrent: {
            test: [
                'copy:styles'
            ],
            dist: [
                <% if (cssExtension === 'compass') { %>'compass:dist',
                <% } else { %>'sass:dist',
                <% } %>'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },

        // DISABLED - Configured via grunt-usemin
        /**
         * grunt-contrib-cssmin
         * @see https://github.com/gruntjs/grunt-contrib-cssmin
         *
         * Compress CSS files.
         */
        // cssmin: {
            // This task is pre-configured if you do not wish to use Usemin
            // blocks for your CSS. By default, the Usemin block from your
            // `index.html` will take care of minification, e.g.
            //
            //     <!-- build:css({<%%= yeoman.dist %>,app}) styles/main.css -->
            //
            // dist: {
            //     files: {
            //         '<%%= yeoman.dist %>/css/main.css': [
            //             '<%%= yeoman.dist %>/css/{,*/}*.css',
            //             '<%%= yeoman.app %>/css/{,*/}*.css'
            //         ]
            //     }
            // }
        // },

        // DISABLED - Configured via grunt-usemin
        /**
         * grunt-contrib-concat
         * @see https://github.com/gruntjs/grunt-contrib-concat
         *
         * Concatenate files.
         */
        /*concat: {
            dist: {}
        },*/

        // DISABLE - Support for RequireJS has been deprecated in usemin 2.0.0
        // @see https://github.com/yeoman/grunt-usemin/issues/112
        /**
         * grunt-contrib-requirejs
         * @see https://github.com/gruntjs/grunt-contrib-requirejs
         *
         * Optimize RequireJS projects.
         * Note: There is no difference between declaring your require config 
         * in your Gruntfile and using a separate requirejs config file.
         */
        /*requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%%= yeoman.app %>/scripts',
                    name: 'main',
                    mainConfigFile: '<%%= yeoman.app %>/scripts/main.js',
                    out: '<%%= yeoman.dist %>/scripts/main.js',
                    optimize: 'none',
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true
                }
            }
        },*/
        /**
         * grunt-bower-requirejs
         * @see https://github.com/yeoman/grunt-bower-requirejs
         *
         * Automagically wire-up installed Bower components into 
         * your RequireJS config.
         */
        /*bower: {
            options: {
                exclude: ['modernizr', 'detectizr']
            },
            all: {
                rjsConfig: '<%%= yeoman.app %>/scripts/main.js'
            }
        }*/

    });

    /****************************************************************
     * Grunt Task Definitions
     ****************************************************************/

    /**
     * Test task
     */
    grunt.registerTask('test', [
        'clean:test',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        // @todo
        //'mocha'
    ]);

    /**
     * Build task
     */
    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        // Disable if usemin has no css and no js
        'concat',
        // Disable if usemin has no css
        'cssmin',
        // Disable if usemin has no js
        'uglify',
        'modernizr',
        'copy:dist',
        'rev',
        'usemin'
    ]);

    /**
     * Default task
     */
    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

};
