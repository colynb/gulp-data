/*global describe, it*/
"use strict";

var fs = require("fs");
var es = require("event-stream");
var should = require("should");
var Q = require("q");

require("mocha");

delete require.cache[require.resolve("../")];

var gutil = require("gulp-util");
var data = require("../");

describe("gulp-data", function() {

  var expectedData = {
    message: 'Hello'
  };

  it("should handle exceptions with the callback present", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file, cb) {
      throw new Error('potato');
    });

    stream.on("error", function(err) {
      should.exist(err);
      should.exist(err.stack);
      done();
    });

    stream.on("end", function() {
      done('fail');
    })

    stream.write(srcFile);
    stream.end();
  })

  it("should handle exceptions without the callback present", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file) {
      throw new Error('potato');
    });

    stream.on("error", function(err) {
      should.exist(err);
      should.exist(err.stack);
      done();
    });

    stream.on("end", function() {
      done('fail');
    })

    stream.write(srcFile);
    stream.end();
  })

  it("should produce errors when data handler has error", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file, cb) {
      cb({ type: 'test-error' });
    });

    stream.on("error", function(err) {
      should.exist(err);
      should.exist(err.message);
      should.exist(err.message.type);
      err.message.should.have.property('type', 'test-error');
      done();
    });

    stream.on("end", function() {
      done('fail');
    })

    stream.write(srcFile);
    stream.end();

  });

  it("should produce errors when promises are rejected", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var deferred = Q.defer(), stream = data(deferred.promise);

    setTimeout(function() {
      deferred.reject({ type: 'test-error' });
    }, 20);

    stream.on("error", function(err) {
      should.exist(err);
      should.exist(err.message);
      should.exist(err.message.type);
      err.message.should.have.property('type', 'test-error');
      done();
    });

    stream.on("end", function() {
      done('fail');
    })

    stream.write(srcFile);
    stream.end();

  });

  it("should work with returned values", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function() {
      return { message: 'Hello' }
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

  it("should work with promises that resolve", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var deferred = Q.defer(), stream = data(deferred.promise);

    setTimeout(function() {
      deferred.resolve({ message: 'Hello' });
    }, 20);

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

  it("should work with mapped promises", function(done) {
    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file) {
      var deferred = Q.defer();
      setTimeout(function() {
        deferred.resolve({ message: file.path });
      }, 20);
      return deferred.promise;
    });



    stream.on("error", function(err) {
      should.exist(err);
      done(err);
    });

    stream.on("data", function(newFile) {
      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', newFile.path);
      done();
    });

    stream.write(srcFile);
    stream.end();
  });

  it("should produce expected file data property", function(done) {

    var srcFile = new gutil.File({
      path: "test/fixtures/hello.txt",
      cwd: "test/",
      base: "test/fixtures",
      contents: fs.readFileSync("test/fixtures/hello.txt")
    });

    var stream = data(function(file, cb) {
      cb(undefined, {
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
