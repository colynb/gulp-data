# [gulp](https://github.com/wearefractal/gulp)-data

[![Build Status](https://travis-ci.org/colynb/gulp-data.png?branch=master)](https://travis-ci.org/colynb/gulp-data)

[![NPM](https://nodei.co/npm/gulp-data.png?stars&downloads)](https://npmjs.org/package/gulp-data)

[Learn more about gulp.js, the streaming build system](http://gulpjs.com)

## Introduction

Gulp-data proposes a common API for attaching data to the file object for other plugins to consume. With gulp-data you can generate a data object from a variety of sources: json, front-matter, database, anything... and set it to the file object for other plugins to consume.

Many plugins, such as ```gulp-swig``` or ```gulp-jade``` allow for JSON data to be passed via their respective options parameter. However, frequently what you want is the ability to dynamically set the data based off the file name or some other attribute of the file. Without using another plugin, this becomes problematic - as the number of ways of getting at data (via JSON files, front-matter, data bases, etc) increases, the more plugin authors have to update their APIs to support these sources. The ```gulp-data``` plugin aims to standardize a method that is generic enough to encapsulate these data sources into a single ```data``` property attached to the file object. It's really up to you as to where your data comes from, a JSON file, from a front-matter section of the file, or even a database, ```gulp-data``` doesn't really care.

## Usage

First, install `gulp-data` as a development dependency:

```shell
npm install --save-dev gulp-data
```

Then, add it to your `gulpfile.js`:

```javascript
var gulp = require('gulp');
var swig = require('gulp-swig');
var data = require('gulp-data');
var fm = require('front-matter');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

/*
  Get data via JSON file, keyed on filename.
*/
var getJsonData = function(file, cb) {
  var jsonPath = './examples/' + path.basename(file.path) + '.json';
  cb(require(jsonPath));
};

gulp.task('json-test', function() {
  return gulp.src('./examples/test1.html')
    .pipe(data(getJsonData))
    .pipe(swig())
    .pipe(gulp.dest('build'));
});

var getFrontMatter = function(file, cb) {
  var content = fm(String(file.contents));
  file.contents = new Buffer(content.body);
  cb(content.attributes);
};

/*
  Get data via front matter
*/
gulp.task('fm-test', function() {
  return gulp.src('./examples/test2.html')
    .pipe(data(getFrontMatter))
    .pipe(swig())
    .pipe(gulp.dest('build'));
});

/*
  Get data via database, keyed on filename.
*/
var getMongoData = function(file, cb) {
  MongoClient.connect('mongodb://127.0.0.1:27017/gulp-data-test', function(err, db) {
    if(err) throw err;
    var collection = db.collection('file-data-test');
    collection.findOne({filename: path.basename(file.path)}, function(err, doc) {
      db.close();
      cb(doc);
    });
  });
};

gulp.task('db-test', function() {
  return gulp.src('./examples/test3.html')
    .pipe(data(getMongoData))
    .pipe(swig())
    .pipe(gulp.dest('build'));
});

```

## API

### data(dataFunction)

#### dataFunction
Type: `Function`  

Define a function that returns a data object via a callback function. Could return JSON from a file, or an object returned from a database.

## Note to gulp plugin authors

If your plugin needs a data object, one that normally gets passed in via your options parameter, please update the plugin to accept data from the ```file.data``` property. Here's how you can do it:

```gulp-swig``` usually accepts data via its ```options.data``` parameter, but with a small change, it checks to see if there's a ```file.data``` property and if so, merges it into the data object.

```
var data = opts.data || {};
if (file.data) {
  data = _.extend(file.data, data);
}
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-data
[npm-image]: https://badge.fury.io/js/gulp-data.png

[travis-url]: http://travis-ci.org/colynb/gulp-data
[travis-image]: https://secure.travis-ci.org/colynb/gulp-data.png?branch=master
