/*
 * grunt-blurred-images
 * https://github.com/valeriansaliou/grunt-blurred-images
 *
 * Copyright (c) 2015 Valérian Saliou
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp', '!tmp/new_files_only/magikarp-200.png', '!tmp/new_files_only/magikarp-300.png']
    },

    // Configuration to be run (and then tested).
    blurred_images: {
      options: {
        engine: 'im'
      },

      default_options: {
        options: {},

        files: {
          'tmp/default_options/minions.jpg': 'test/assets/default_options/minions.jpg'
        }
      },

      no_files: {
        options: {
          levels: [{
            level: 2
          }]
        },

        files: [{
          expand: true,
          src: ['no_files/**/*.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      file_wildcard_options: {
        options: {
          levels: [{
            name: 'low',
            level: 2
          }, {
            name: 'medium',
            level: 4
          }, {
            name: 'high',
            level: 8
          }]
        },

        files: [{
          expand: true,
          src: ['file_wildcard_options/**.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      custom_options: {
        options: {
          levels: [{
            level: 1,
            name: "low",
            quality: 40
          }, {
            level: 2,
            quality: 100
          }, {
            level: 3,
            name: "high",
            quality: 80
          }, {
            level: 4,
            name: "high",
            suffix: "_4pc",
            quality: 50
          }, {
            level: 5,
            name: "highest",
            quality: 50
          }]
        },

        files: [{
          expand: true,
          src: ['custom_options/**.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      custom_dest_level: {
        options: {
          levels: [{
            level: 3
          }, {
            level: 6
          }, {
            level: 10
          }]
        },

        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_level/',
          custom_dest: 'tmp/custom_dest_level/{%= level %}/'
        }]
      },

      custom_dest_name: {
        options: {
          levels: [{
            level: 1,
            name: "leo"
          }, {
            level: 2,
            name: "donnie"
          }, {
            level: 4,
            name: "raph"
          }]
        },

        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_name/',
          custom_dest: 'tmp/custom_dest_name/{%= name %}/'
        }]
      },

      custom_dest_path: {
        options: {
          levels: [{
            level: 1
          }, {
            level: 5
          }, {
            level: 9
          }]
        },

        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_path/',
          custom_dest: 'tmp/custom_dest_path/{%= level %}/{%= path %}'
        }]
      },

      rename: {
        options: {
          levels: [{
            level: "100%",
            name: "unchanged",
            rename: false
          }, {
            level: "50%",
            name: "half"
          }]
        },

        files: [{
          expand: true,
          src: ['rename/**.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      global_quality: {
        options: {
          tryAnimated: true,
          quality: 80,
          levels: [{
            level: 3
          }, {
            level: 6
          }, {
            level: 10
          }]
        },

        files: [{
          expand: true,
          src: ['global_quality/**/*.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      animated: {
        options: {
          tryAnimated: true,
          quality: 80,
          levels: [{
            level: 3
          }]
        },

        files: [{
          expand: true,
          src: ['animated/**/*.gif'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      new_files_only_prep: {
        options: {
          levels: [{
              level: '20%'
            }, {
              level: '30%'
            }]
        },

        files: [{
          expand: true,
          src: ['new_files_only/gummi-bears.jpg'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },

      new_files_only: {
        options: {
          newFilesOnly: true,

          levels: [{
              level: '10%'
            }, {
              level: '20%'
            }, {
              level: '30%'
            }]
        },

        files: [{
          expand: true,
          src: ['new_files_only/**/*.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/**/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'blurred_images', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
