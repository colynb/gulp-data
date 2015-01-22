/*global describe, it*/
'use strict';

var should = require('should');
var Q = require('q');

require('mocha');

delete require.cache[require.resolve('../')];

var data = require('../');
var File = require('vinyl');

describe('gulp-data', function() {


  it('should handle exceptions with the callback present', function(done) {
    data(function() {
      throw new Error('potato');
    })
    .on('error', function(err) {
      should.exist(err);
      should.exist(err.message);
      done();
    })
    .on('end', function() {
      done('fail');
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should handle exceptions without the callback present', function(done) {
    data(function() {
      throw new Error('potato');
    })
    .on('error', function(err) {
      should.exist(err);
      should.exist(err.message);
      done();
    })
    .on('end', function() {
      done('fail');
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should produce errors when data handler has error', function(done) {
    data(function(file, cb) {
      cb({ type: 'test-error' });
    })
    .on('error', function(err) {
      should.exist(err);
      should.exist(err.message);
      should.exist(err.message.type);
      err.message.should.have.property('type', 'test-error');
      done();
    })
    .on('end', function() {
      done('fail');
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should produce errors when promises are rejected', function(done) {
    var deferred = Q.defer();

    setTimeout(function() {
      deferred.reject({ type: 'test-error' });
    }, 20);

    data(deferred.promise)
    .on('error', function(err) {
      should.exist(err);
      should.exist(err.message);
      should.exist(err.message.type);
      err.message.should.have.property('type', 'test-error');
      done();
    })
    .on('end', function() {
      done('fail');
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should work with returned values', function(done) {
    data(function() {
      return { message: 'Hello' };
    })
    .on('error', function(err) {
      should.exist(err);
      done(err);
    })
    .on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', 'Hello');
      done();
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should work with promises that resolve', function(done) {
    var deferred = Q.defer();

    setTimeout(function() {
      deferred.resolve({ message: 'Hello' });
    }, 20);

    data(deferred.promise)
    .on('error', function(err) {
      should.exist(err);
      done(err);
    })
    .on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', 'Hello');
      done();
    })
    .end(new File({contents: new Buffer('')}));
  });

  it('should work with mapped promises', function(done) {
    data(function(file) {
      var deferred = Q.defer();
      setTimeout(function() {
        deferred.resolve({ message: file.path });
      }, 20);
      return deferred.promise;
    })
    .on('error', function(err) {
      should.exist(err);
      done(err);
    })
    .on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', newFile.path);
      done();
    })
    .end(new File({
      path: 'test/fixtures/hello.txt',
      contents: new Buffer('')
    }));
  });

  it('should produce expected file data property', function(done) {
    data(function(file, cb) {
      cb(undefined, {
        message: 'Hello'
      });
    })
    .on('error', function(err) {
      should.exist(err);
      done(err);
    })
    .on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.data);
      newFile.data.should.have.property('message', 'Hello');
      done();
    })
    .end(new File({contents: new Buffer('')}));
  });

});
