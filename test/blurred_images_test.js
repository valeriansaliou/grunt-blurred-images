/**
 * grunt-blurred-images
 * https://github.com/valeriansaliou/grunt-blurred-images
 *
 * Copyright (c) 2015 Valérian Saliou
 * Licensed under the MIT license.
 *
 * Test suite for Grunt Blurred Images
 *
 * @author Valérian Saliou (https://valeriansaliou.name/)
 * @version 1.0.0
 */


/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

(function() {
  'use strict';

  var async = require('async');
  var gm    = require('gm');
  var grunt = require('grunt');
  var q = require('q');

  /**
   * Compare the created image against the expected image.
   *
   * @private
   * @param   {string}  filename  The name of the file
   * @param   {string}  actual    The actual file path
   * @param   {string}  expected  The expected file path
   * @return  {object}  promise   Either resolved rejected with an error message.
   */
  var compareImageProperties = function(filename, actualPath, expectedPath) {
    var deferred = q.defer();

    // load created image
    gm(actualPath + filename).options({imageMagick: true}).identify(function(error, actualProp) {
      if (error) {
        deferred.reject('Failed to load actual (created) image "' + actualPath + filename + '"');
      } else {
        // load expected image
        gm(actualPath + filename).options({imageMagick: true}).identify(function(error, expectedProp) {
          if (error) {
            deferred.reject('Failed to load expected image "' + expectedPath + filename + '"');
          } else {
            // check if we have a match
            if ((actualProp.Compression === expectedProp.Compression) &&
              (actualProp['JPEG-Quality'] === expectedProp['JPEG-Quality'])) {
              deferred.resolve(true);
            } else {
              deferred.reject(filename + ': ' +
                'actual image (' + actualProp.compression + ' ' + actualProp.size.level +
                '% blur - Q:' + actualProp.quality +
                ') and ' +
                'expected image (' + expectedProp.compression + ' ' + expectedProp.size.level +
                '% blur - Q:' + expectedProp.quality +
                ') should match');
            }
          }
        });
      }
    });
    return deferred.promise;
  };

  /**
   * Inspect and handle test results from inspecting an image
   *
   * @private
   * @param   {object}  file      The file object
   * @param   {object}  test      Test instance
   * @param   {string}  callback  Async callback, to be run when the test is complete
   */
  var inspectImage = function(file, test, callback) {
    compareImageProperties(file.filename, file.actual, file.expected)
    .then(function(result) {
      test.ok(true);
    }, function(error) {
      test.ok(false, error);
    })
    .done(function() {
      return callback();
    });
  };

  /**
   * Run through the array of files and add them to the queue of images to be tested
   *
   * @private
   * @param   {array}   files     List of files to check (with filename, expected and actual paths)
   * @param   {object}  test      Test instance
   */
  var checkImages = function(actual, expected, files, test) {
    var series = [],
        file = {};

    test.expect(files.length);

    files.forEach(function(filename) {
      var file = {
        actual: actual,
        expected: expected,
        filename: filename
      };

      series.push(function(callback) {
        inspectImage(file, test, callback);
      });
    });

    async.series(series, function() {
      test.done();
    });
  };


  // List of tests to be run
  exports.blurred_images = {
    default_options: function(test) {
      var actualPath = 'tmp/default_options/',
          expectedPath = 'test/expected/default_options/',
          files = [
            'minions-low.jpg',
            'minions-medium.jpg',
            'minions-high.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    file_wildcard_options: function(test) {
      var actualPath = 'tmp/file_wildcard_options/',
          expectedPath = 'test/expected/file_wildcard_options/',
          files = [
            'sonic-low.png',
            'sonic-medium.png',
            'sonic-high.png',
            'mario-yoshi-low.jpg',
            'mario-yoshi-medium.jpg',
            'mario-yoshi-high.jpg',
            'mickey-mouse-low.gif',
            'mickey-mouse-medium.gif',
            'mickey-mouse-high.gif'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    custom_options: function(test) {
      var actualPath = 'tmp/custom_options/',
          expectedPath = 'test/expected/custom_options/',
          files = [
            'panther-low.jpg',
            'panther-high_4pc.jpg',
            'panther-high.jpg',
            'panther-highest.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    custom_dest_level: function(test) {
      var actualPath = 'tmp/custom_dest_level/',
          expectedPath = 'test/expected/custom_dest_level/',
          files = [
            '3/cedric_sneer.jpg',
            '6/cedric_sneer.jpg',
            '10/cedric_sneer.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    custom_dest_name: function(test) {
      var actualPath = 'tmp/custom_dest_name/',
          expectedPath = 'test/expected/custom_dest_name/',
          files = [
            'leo/tmnt.png',
            'donnie/tmnt.png',
            'raph/tmnt.png'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    custom_dest_path: function (test) {
      var actualPath = 'tmp/custom_dest_path/',
          expectedPath = 'test/expected/custom_dest_path/',
          files = [
            '1/battle-cat.jpg',
            '1/sub_directory/battle-dog.jpg',
            '5/battle-cat.jpg',
            '5/sub_directory/battle-dog.jpg',
            '9/battle-cat.jpg',
            '9/sub_directory/battle-dog.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    rename: function(test) {
      var actualPath = 'tmp/rename/',
        expectedPath = 'test/expected/rename/',
        files = [
          'minions.jpg',
          'minions-half.jpg'
        ];

      checkImages(actualPath, expectedPath, files, test);
    },
    global_quality: function(test) {
      var actualPath = 'tmp/global_quality/',
          expectedPath = 'test/expected/global_quality/',
          files = [
            'night_garden-3pc.jpg',
            'night_garden-6pc.jpg',
            'night_garden-10pc.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    animated: function(test) {
      var actualPath = 'tmp/animated/',
          expectedPath = 'test/expected/animated/',
          files = [
            'olaf-3pc.gif',
            'cat_fun-3pc.gif'
          ];

      checkImages(actualPath, expectedPath, files, test);
    },
    new_files_only: function(test) {
      var actualPath = 'tmp/new_files_only/',
          expectedPath = 'test/expected/new_files_only/',
          files = [
            'gummi-bears-10pc.jpg',
            'gummi-bears-20pc.jpg',
            'gummi-bears-30pc.jpg',
            'darkwing-duck-10pc.jpg',
            'darkwing-duck-20pc.jpg',
            'darkwing-duck-30pc.jpg'
          ];

      checkImages(actualPath, expectedPath, files, test);
    }
  };

  // It works! I finally invent something that works!

}());
