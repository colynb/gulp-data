/*global describe, it*/
"use strict";

var fs = require("fs");
var es = require("event-stream");
var should = require("should");

require("mocha");

delete require.cache[require.resolve("../")];

var gutil = require("gulp-util");
var data = require("../");

describe("gulp-data", function() {

  var expectedData = {
    message: 'Hello'
  };

  it("should produce expected file data property", function(done) {

    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file, cb) {
      cb({
        message: 'Hello'
      });
    });

    stream.on("error", function(err) {
      should.exist(err);
      done(err);
    });

    stream.on("data", function(newFile) {

      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', 'Hello');
      done();
    });

    stream.write(srcFile);
    stream.end();
  });

});
