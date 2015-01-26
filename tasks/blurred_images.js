/**
 * grunt-blurred-images
 * https://github.com/valeriansaliou/grunt-blurred-images
 *
 * Copyright (c) 2015 Valérian Saliou
 * Licensed under the MIT license.
 *
 * Create images at different blur levels.
 *
 * @author Valérian Saliou (https://valeriansaliou.name/)
 * @version 1.0.0
 */

'use strict';

module.exports = function(grunt) {

  var _     = require('lodash');
  var async = require('async');
  var gm    = require('gm');
  var path  = require('path');

  var DEFAULT_OPTIONS = {
    engine: 'gm',               // gm or im
    newFilesOnly: true,         // NEW VALUE - whether to only run for new files/levels only
    quality: 100,               // value between 1 and 100
    rename: true,               // whether file should keep its name
    separator: '-',             // separator between name and blur level
    tryAnimated: false,         // DEFAULT CHANGED - whether to try to blur animated files

    levels: [{
      name: 'low',
      level: 1
    },{
      name: 'medium',
      level: 5
    },{
      name: 'high',
      level: 9
    }]
  };

  var DEFAULT_UNIT_OPTIONS = {
    percentage: 'pc'
  };

  // details about the GFX rendering engines being used
  var GFX_ENGINES = {
    im: {
      name: 'ImageMagick',
      brewurl: 'imagemagick',
      url: 'http://www.imagemagick.org/script/binary-releases.php',
      alternative: {
        code: 'gm',
        name: 'GraphicsMagick'
      }
    },
    gm: {
      name: 'GraphicsMagick',
      brewurl: 'graphicsmagick',
      url: 'http://www.graphicsmagick.org/download.html',
      alternative: {
        code: 'im',
        name: 'ImageMagick'
      }
    }
  };

  var cache = {},
      gfxEngine = {};

  /**
   * Set the engine to ImageMagick or GraphicsMagick
   *
   * @private
   * @param  {string}          engine     im for ImageMagick, gm for GraphicsMagick
   */
  var getEngine = function(engine) {
    if (typeof GFX_ENGINES[engine] === 'undefined') {
      return grunt.fail.warn('Invalid render engine specified');
    }
    grunt.verbose.ok('Using render engine: ' + GFX_ENGINES[engine].name);

    if (engine === 'im') {
      return gm.subClass({ imageMagick: (engine === 'im') });
    }

    return gm;
  };

  /**
   * Checks for a valid array, and that there are items in the array.
   *
   * @private
   * @param   {object}          obj       The object to check
   * @return  {boolean}         Whether it is a valid array with items.
   */
  var isValidArray = function(obj) {
   return (_.isArray(obj) && obj.length > 0);
  };

  /**
   * Checks for a valid level.
   *
   * @private
   * @param   {number/string}   level     The level, either as a number or a percentage
   * @return  {boolean}         Whether the level is valid.
   */
  var isValidLevel = function(level) {
    // Valid values = 1, '1%', '1', '1%', '1.1%', '11.11111%', '111111%'
    // Invalid values = -1, '1.1.1%', '1a', 'a1'
    var pcRegExp = /^[0-9]*\.?[0-9]+%?$/,
        isValid = false;

    if (level) {
      // check if we have a valid percentage value
      if (!!(level || 0).toString().match(pcRegExp)) {
        isValid = true;
      } else {
        grunt.log.error('Level value is not valid.');
      }

    } else {
      grunt.log.error('Level must be specified.');
    }

    return isValid;
  };

  var isValidQuality = function(quality) {
    return (quality > 1);
  };

  /**
   * Create a name to suffix to our file.
   *
   * @private
   * @param   {object}          properties Contains properties for name, level (where applicable)
   * @return  {string}          A new name
   */
  var getName = function(properties, options) {
    // name takes precedence
    if (properties.name) {
      return properties.name;
    } else if (properties.level) {
      return parseFloat(properties.level) + 'pc';
    }
  };


  /**
   * Add a prefix and/or a suffix to a value.
   *
   * @private
   * @param   {string}          value         The value to prefix/suffix
   * @param   {string}          prefix        The required prefix (optional)
   * @param   {string}          suffix        The required suffix (optional)
   */
  var addPrefixSuffix = function(value, prefix, suffix, rename) {
    if (rename) {
      return (prefix || '') + value + (suffix || '');
    } else {
      return (suffix || '');
    }
  };

  /**
   * Check the target has been set up properly in Grunt.
   * Graceful handling of https://github.com/valeriansaliou/grunt-blurred-images/issues/2
   *
   * @private
   * @param   {object}          files         The files object
   */
  var checkForValidTarget = function(files) {
    var test;

    try {
      test = files.src;
    } catch (exception) {
      grunt.fail.fatal('Unable to read configuration.\n' +
      'Have you specified a target? See: http://gruntjs.com/configuring-tasks');
    }
  };

  /**
   * Check that there is only one source file in compact/files object format.
   *
   * @private
   * @param   {object}          files         The files object
   */
  var checkForSingleSource = function(files) {
    // more than 1 source.
    if (files.src.length > 1) {
      return grunt.fail.warn('Unable to blur more than one image in compact or files object format.\n'+
      'For multiple files please use the files array format.\nSee http://gruntjs.com/configuring-tasks');
    }
  };

  /**
   * Check if a directory exists, and create it if it doesn't.
   *
   * @private
   * @param   {string}          dirPath   The path we want to check
   */
  var checkDirectoryExists = function(dirPath) {
    if (!grunt.file.isDir(dirPath)) {
      grunt.file.mkdir(dirPath);
    }
  };

  /**
   * Removes characters from the values of the object keys specified
   *
   * @private
   * @param   {object}          obj       The object to inspect.
   * @param   {array}           keys      The keys to check the values of.
   * @param   {string}          remove    The string to remove.
   */
  var removeCharsFromObjectValue = function(obj, keys, remove) {
    var i = 0,
      l = keys.length;
    for (i = 0; i < l; i++) {
      if (obj[keys[i]] && obj[keys[i]].toString().indexOf(remove) > -1) {
      obj[keys[i]] = obj[keys[i]].toString().replace(remove, '');
      }
    }
    return obj;
  };

  /**
   * Handle showing errors to the user.
   *
   * @private
   * @param   {string}          error     The error message.
   * @param   {string}          engine    The graphics engine being used.
   */
  var handleImageErrors = function(error, engine) {

    if (error.message.indexOf('ENOENT') > -1) {
      grunt.log.error(error.message);

      grunt.fail.warn('\nPlease ensure ' + GFX_ENGINES[engine].name + ' is installed correctly.\n' +
      '`brew install ' + GFX_ENGINES[engine].brewurl + '` or see ' + GFX_ENGINES[engine].url + ' for more details.\n' +
      'Alternatively, set options.engine to \'' + GFX_ENGINES[engine].alternative.code + '\' to use ' + GFX_ENGINES[engine].alternative.name + '.\n');
    } else {
      grunt.fail.warn(error.message);
    }
  };

  var isAnimatedGif = function(data, dstPath, tryAnimated) {
    // GIF87 cannot be animated.
    // data.Delay and Scene can identify an animation GIF
    if (!tryAnimated && data && data.format && data.format.toUpperCase() === 'GIF' && data.Delay && data.Scene) {
      grunt.verbose.warn(dstPath + ' is animated - skipping');
      return true;
    }
  };

  /**
   * Outputs the result of the tally.
   *
   * @private
   * @param   {number}          count     The file count.
   * @param   {string}          name      Name of the image.
   */
  var outputResult = function(count, name) {
    if (count) {
      grunt.log.writeln('Blurred ' + count.toString().cyan + ' ' +
      grunt.util.pluralize(count, 'file/files') + ' for ' + name);
    }
  };

  /**
   * Check whether a new version exists
   *
   * @private
   * @param   {string}          srcPath     File source path
   * @param   {string}          dstPath     File destination path
   */
  var isFileNewVersion = function(srcPath, dstPath) {
    return (!grunt.file.exists(dstPath));
  };

  var processImage = function(srcPath, dstPath, sizeOptions, tally, callback) {
    var image = gfxEngine(srcPath);

    image.identify(function(err, data) {
      if(err) {
        handleImageErrors(err, sizeOptions.engine);
      }

      if(!isAnimatedGif(data, dstPath, sizeOptions.tryAnimated)) {
        image.blur(sizeOptions.level, (sizeOptions.level / 3))
             .quality(sizeOptions.quality);

        image.write(dstPath, function (error) {
          if (error) {
            handleImageErrors(error, sizeOptions.engine);
          } else {
            grunt.verbose.ok('Blurred Image: ' + srcPath + ' now '+ dstPath);
            tally[sizeOptions.id]++;
          }

          return callback();
        });
      } else {
        return callback();
      }
    });
  };


  /**
   * Gets the destination path
   *
   * @private
   * @param   {string}          srcPath   The source path
   * @param   {string}          filename  Image Filename
   * @param   {object}          blurOptions
   * @param   {string}          customDest
   * @param   {string}          origCwd
   * @return                    The complete path and filename
   */
  var getDestination = function(srcPath, dstPath, blurOptions, customDest, origCwd) {
    var baseName = '',
        dirName = '',
        extName = '';

    extName = path.extname(dstPath);
    baseName = path.basename(dstPath, extName); // filename without extension

    if (customDest) {

      blurOptions.path = srcPath.replace(new RegExp(origCwd), "").replace(new RegExp(path.basename(srcPath)+"$"), "");

      grunt.template.addDelimiters('level', '{%', '%}');

      dirName = grunt.template.process(customDest, {
        delimiters: 'level',
        data: blurOptions
      });

      checkDirectoryExists(path.join(dirName));
      return path.join(dirName, baseName + extName);
    } else {
      dirName = path.dirname(dstPath);
      checkDirectoryExists(path.join(dirName));
      return path.join(dirName, baseName + blurOptions.outputName + extName);
    }
  };

  // let's get this party started

  grunt.registerMultiTask('blurred_images', 'Produce blurred versions of images. Used to reproduce Medium blur-on-scroll effect.', function() {

    var done = this.async();
    var i = 0;
    var series = [];
    var options = this.options(DEFAULT_OPTIONS); // Merge task-specific and/or target-specific options with these defaults.
    var tally = {};
    var task = this;

    if (!isValidArray(options.levels)) {
      return grunt.fail.fatal('No levels have been defined.');
    }

    gfxEngine = getEngine(options.engine);

    options.units = _.extend(_.clone(DEFAULT_UNIT_OPTIONS), options.units);

    options.levels.forEach(function(s) {

      var blurOptions = _.extend({}, options, s);

      if (!isValidLevel(blurOptions.level)) {
        // allow task to be by-passed if no images
        return grunt.log.warn('Level is invalid (' + blurOptions.level + ')');
      }

      if (!isValidQuality(blurOptions.quality)) {
        return grunt.log.warn('Quality configuration has changed to values between 1 - 100. Please update your configuration');
      }

      blurOptions.id = i;
      i++;

      tally[blurOptions.id] = 0;

      if (task.files.length === 0) {
        return grunt.log.warn('Unable to compile; no valid source files were found.');
      } else {

        // Iterate over all specified file groups.
        task.files.forEach(function(f) {

          var srcPath = '',
            dstPath = '';

          checkForValidTarget(f);
          checkForSingleSource(f);

          // create a name for our image based on name, level
          blurOptions.name = getName({ name: blurOptions.name, level: blurOptions.level }, options);

          // create an output name with prefix, suffix
          blurOptions.outputName = addPrefixSuffix(blurOptions.name, blurOptions.separator, blurOptions.suffix, blurOptions.rename);

          srcPath = f.src[0];
          dstPath = getDestination(srcPath, f.dest, blurOptions, f.custom_dest, f.orig.cwd);

          // remove pixels from the value so the gfx process doesn't complain
          blurOptions = removeCharsFromObjectValue(blurOptions, ['level'], '%');

          series.push(function(callback) {

            if (blurOptions.newFilesOnly) {
              if (isFileNewVersion(srcPath, dstPath)) {
                return processImage(srcPath, dstPath, blurOptions, tally, callback);
              } else {
                grunt.verbose.ok('File already exists: ' + dstPath);
                return callback();
              }
            } else {
              return processImage(srcPath, dstPath, blurOptions, tally, callback);
            }

          });
        });

        series.push(function(callback) {
          outputResult(tally[blurOptions.id], blurOptions.name);
          return callback();
        });
      }
    });

    async.series(series, done);
  });

};
