var through = require("through2");
var gutil = require("gulp-util");

module.exports = function(data) {
  "use strict";

  // if necessary check for required param(s), e.g. options hash, etc.
  if (!data) {
    throw new gutil.PluginError("gulp-data", "No data supplied");
  }

  // see "Writing a plugin"
  // https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md

  function gulpData(file, enc, callback) {
    /*jshint validthis:true*/

    // Do nothing if no contents
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {

      // http://nodejs.org/api/stream.html
      // http://nodejs.org/api/child_process.html
      // https://github.com/dominictarr/event-stream

      // accepting streams is optional
      this.emit("error",
        new gutil.PluginError("gulp-data", "Stream content is not supported"));
      return callback();
    }

    // check if file.contents is a `Buffer`
    if (file.isBuffer()) {
      var self = this;
      if (typeof data === 'function') {
        data = data(file, function(result){
          file.data = result;
          self.push(file);
          callback();
        });
      }
    }
  }

  return through.obj(gulpData);
};
