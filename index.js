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
    var self = this, called = false;

    function handle(err, result){
      // extra guard in case
      if (called) return;
      called = true;
      if (err) {
        self.emit("error", new gutil.PluginError("gulp-data", { message: err }));
        return callback();
      }
      file.data = result;
      self.push(file);
      callback();
    }

    function local(data) {
      if (data && typeof data.then === 'function')
        data.then(function(data){ return handle(undefined, data) }, function(err) { return handle(err); });
      else
        handle(undefined, data);
    }

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
      this.emit("error", new gutil.PluginError("gulp-data", "Stream content is not supported"));
      return callback();
    }

    // check if file.contents is a `Buffer`
    if (file.isBuffer()) {
      var res = null;
      if (typeof data === 'function')
          try {
            res = data(file, handle);
            if (data.length <= 1)
              return local(res)
          } catch(e) {
            return handle(e);
          }
      else
        local(data);
    }
  }

  return through.obj(gulpData);
};
