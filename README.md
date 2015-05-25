# grunt-blurred-images

[![Build Status](https://travis-ci.org/valeriansaliou/grunt-blurred-images.svg?branch=master)](https://travis-ci.org/valeriansaliou/grunt-blurred-images) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/valeriansaliou/grunt-blurred-images?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Produce blurred versions of images. Used to reproduce Medium blur-on-scroll effect.

## Getting Started
This plugin requires Grunt `~0.4.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-blurred-images --save-dev
```

You also need to install either GraphicsMagick or Imagemagick CLI tools.

**Installing GraphicsMagick (Recommended)**

If you're a Mac user and have [Homebrew](http://brew.sh/) installed, simply type:
```shell
brew install GraphicsMagick
```
Otherwise, please visit the [GraphicsMagick downloads page](http://sourceforge.net/projects/graphicsmagick/files/graphicsmagick/).


**Or installing ImageMagick**

If you're a Mac user and have [Homebrew](http://brew.sh/) installed, simply type:
```shell
brew install ImageMagick
```
Otherwise, please visit the [ImageMagick downloads page](http://www.imagemagick.org/script/binary-releases.php).

Once both the plugin and graphics engine have been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-blurred-images');
```

## The "blurred_images" task

### Overview

The blurred_images task will take your source image and create images at the specified blur levels, allowing you to reproduce the Medium blur on scroll effect. See [this article](http://bassta.bg/2013/12/medium-com-like-blurred-header-effect/) for more details about this effect.

In your project's Gruntfile, add a section named `blurred_images` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  blurred_images: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

* **options.engine**<br />
  *Type:* `String`<br />
  *Default:* `gm`<br />
  *Available Values:* `gm` || `im`<br />
  *Version:* 0.1.0 and above

  Chooses which graphics engine to use when blurring images. To use GraphicsMagick, set this to `gm`. To use ImageMagick, set this to `im`. You'll need the relevant engine installed.

* **options.newFilesOnly**<br />
  *Type:* `Boolean`<br />
  *Default:* `true`<br />
  *Version:* 0.1.0 and above

  Only process files that do not already exist in the destination folder. Note this is a rather basic check for whether to process files, it does not check timestamps or file data currently. This option is useful for making the task fast during development.

* **options.levels**<br />
  *Type:* `Array`<br />
  *Default:* `[{ name: 'low', level: 1 }, { name: 'medium', level: 4 }, { name: 'high', level: 8 }]`<br />
  *Version:* 0.1.0 and above

  An array of objects containing the levels and settings we want to blur our image.

  For example:
  ```js
levels: [{
      name: "low",
      level: 2
}, {
      name: "high",
      level: 10
  }]
```

  The settings available are as follows:

  * **name**<br />
    *Type:* `String`<br />
    *Default:* none<br />
    *Version:* 0.1.0 and above

    If a `name` is specified, then the file will be suffixed with this name. e.g. `my-image-low.jpg`<br />
    If a `name` is not specified, then the file will be suffixed with the value specified in the level options. e.g. `my-image-1.jpg`

  * **rename**<br />
    *Type:* `Boolean`<br />
    *Default:* `true`<br />
    *Version:* 0.1.0 and above

    If `rename` is set to `false`, then at this level the file will not be renamed, but will instead keep its original name. Suffixes will still be applied.

  * **quality**<br />
    *Type:* `Number`<br />
    *Default:* `100`<br />
    *Available Values:* `1` - `100`<br />
    *Version:* 0.1.0 and above

    JPEG format only. The quality of the image, 100 being the highest quality and 1 being the lowest.

    Please note: In versions below 0.1.0, quality is specified between 0 and 1.

  * **suffix**<br />
    *Type:* `String`<br />
    *Default:* none<br />
    *Version:* 0.1.0 and above

    Use `suffix` to change filenames. e.g. `my-image-low_1.jpg`

* **options.separator**<br />
  *Type:* `String`<br />
  *Default:* `-`<br />
  *Version:* 0.1.0 and above

  The character used to separate the image filename from the level value.

### Usage Examples

#### Default Options
Using the default options will produce 3 blurred images - one at 1% blur, one at 5% blur and one at 9% blur.

```js
grunt.initConfig({
  blurred_images: {
    myTask: {
      options: {},
      files: {
        'dest/mario-yoshi.jpg': 'test/assets/mario-yoshi.jpg'
      }
    }
  }
})
```

#### Custom Options
In this example, we specify our own image blur levels. We also specify our files with a wildcard.

```js
grunt.initConfig({
  blurred_images: {
    myTask: {
      options: {
        levels: [{
          name: 'low',
          level: 2
        }, {
          name: 'medium',
          level: 5
        }, {
          name: "high",
          level: 10,
          suffix: "xlarge",
          quality: 60
        }]
      },
      files: [{
        expand: true,
        src: ['assets/**.{jpg,gif,png}'],
        cwd: 'test/',
        dest: 'tmp/'
      }]
    }
  },
})
```

#### Custom Destination
If you would like to output each image level to a different directory, you can do so with custom_dest. For example:

```js
grunt.initConfig({
  blurred_images: {
    myTask: {
      options: {
        levels: [{
          name: 'low',
          level: 2
        }, {
          name: 'medium',
          level: 5
        }, {
          name: "high",
          level: 10
          suffix: "xlarge",
          quality: 60
        }]
      },
      files: [{
        expand: true,
        src: ['**.{jpg,gif,png}'],
        cwd: 'test/assets/custom_dest/',
        custom_dest: 'tmp/custom_dest/{%= level %}/'
      }]
    }
  },
})
```

You can use `{%= level %}`, `{%= name %}` or `{%= path %}` as a delimiter.

Please note that `{%= level %}` and `{%= name %}` are only available if they are set in the object literal that you use to set each generated level option.

The `{%= path %}` value contains additional directory structure from the current working directory (cwd in files array) to each image.  Using `{%= path %}` allows any complex directory structure to persist into the rendered blurred images directory.

NOTE: for grunt-blurred-images to pick up images within subdirectories you must set your files.src property to `**/*.{jpg,gif,png}`.

## Acknowledgements

This module is based on the work of [@andismith](https://www.npmjs.com/~andismith) on [grunt-responsive-images](https://www.npmjs.com/package/grunt-responsive-images).

I am deeply thankful to this guy for his thorough work on grunt-responsive-images, which helped save a lot of time while developing grunt-blurred-images.
