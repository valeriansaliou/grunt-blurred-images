'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    blurred_images: {
      dev: {
        options: {
          levels: [{
            level: 1,
            name: 'low'
          }, {
            level: 5,
            name: 'medium'
          }, {
            level: 10,
            name: 'large'
          }]
        },

        files: [{
          expand: true,
          src: ['assets/img/**/*.{jpg,gif,png}'],
          cwd: 'src/',
          dest: 'dist/'
        }]
      }
    },

    connect: {
      dev: {
        options: {
          port: 3000,
          base: './dist/'
        }
      }
    },

    copy: {
      dev: {
        files: [{
          expand: true,
          src: ['**/*', '!assets/img/**/*.*'],
          cwd: 'src/',
          dest: 'dist/'
        }]
      }
    },

    watch: {
      options: {
        livereload: true
      },

      all_files: {
        expand: true,
        files: ['**/*', '!assets/img/**/*.*'],
        tasks: 'copy'
      },

      images: {
        expand: true,
        files: 'assets/img/**/*.{jpg,gif,png}',
        tasks: 'blurred_images'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-responsive-images');

  grunt.registerTask('default', ['copy','blurred_images', 'connect', 'watch']);
};
