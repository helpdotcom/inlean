'use strict'

var test = require('tap').test
var Client = require('../')
var http = require('http')

var opts = {
  host: 'http://127.0.0.1:8086'
, tags: {
    platform: process.platform
  , service: 'test'
  }
, db: 'biscuits'
}

test('setup', function(t) {
  var server = require('./server')
  server.listen(9999, function(err) {
    if (err) {
      t.bailout('server failed to start')
      return
    }
    t.end()
  })
})

test('Client', function(t) {
  t.plan(6)
  t.throws(function() {
    new Client()
  }, /opts is required/)

  t.throws(function() {
    new Client({})
  }, /opts.host is required/)

  var client = new Client(opts)

  t.deepEqual(client.opts, opts)
  t.deepEqual(client.tags, opts.tags)
  t.equal(client.db, 'biscuits')
  t.equal(client.host, 'http://127.0.0.1:8086')
})

test('setDb', function(t) {
  t.plan(2)

  var client = new Client(opts)
  t.throws(function() {
    client.setDb()
  }, /db must be a string/)

  client.setDb('test')
  t.equal(client.db, 'test')
})

test('createDb missing name', function(t) {
  t.plan(1)
  var client = new Client({
    host: 'http://127.0.0.1:8086'
  })

  client.createDb(null, function(err) {
    t.equal(err.message, 'name is required')
  })
})

test('Client#createDb error', function(t) {
  t.plan(2)
  var client = new Client({
    host: 'http://127.0.0.1:1111'
  })

  client.createDb('biscuits', function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.code, 'ECONNREFUSED')
  })
})

test('Client#createDb', function(t) {
  t.plan(6)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  })

  client.createDb('ERROR', function(err, res) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'something went wrong', 'message is correct')
  })

  client.createDb('SUCCESS', function(err, res) {
    t.ifError(err, 'err should not exists')
  })

  client.createDb('NOPE', function(err, res) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'Received non-200 status code')
    t.equal(err.code, 400)
  })
})

test('Client#write error', function(t) {
  t.plan(4)
  var client = Client({
    host: 'http://127.0.0.1:1111'
  })

  client.write('biscuits', function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.code, 'ECONNREFUSED')
  })

  client.write(null, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'data must be a string or buffer')
  })
})

test('Client#write', function(t) {
  t.plan(7)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client.write('200', function(err, res) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'request understood, but not written', 'message')
    t.equal(err.code, 200, 'err.code === 400')
  })

  client.write('204', function(err, res) {
    t.ifError(err, 'err should not exist')
  })

  client.write('400', function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'request failed', 'message')
    t.equal(err.code, 400, 'err.code === 400')
  })
})

test('Client#writeFloat', function(t) {
  t.plan(7)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client.writeFloat(null, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts must be an object')
  })

  client.writeFloat({}, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.name is required')
  })

  client.writeFloat({
    name: 'biscuits'
  }, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.val is required')
  })

  client.writeFloat({
    name: 'biscuits'
  , val: 100
  }, function(err) {
    t.ifError(err, 'err should not exist')
  })
})

test('Client#writeInt', function(t) {
  t.plan(7)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client.writeInt(null, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts must be an object')
  })

  client.writeInt({}, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.name is required')
  })

  client.writeInt({
    name: 'biscuits'
  }, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.val is required')
  })

  client.writeInt({
    name: 'test'
  , val: 100
  }, function(err) {
    t.ifError(err, 'err should not exist')
  })
})

test('Client#writeBool', function(t) {
  t.plan(7)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client.writeBool(null, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts must be an object')
  })

  client.writeBool({}, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.name is required')
  })

  client.writeBool({
    name: 'biscuits'
  }, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.val is required')
  })

  client.writeBool({
    name: 'test'
  , val: true
  }, function(err) {
    t.ifError(err, 'err should not exist')
  })
})

test('Client#writeString', function(t) {
  t.plan(7)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client.writeString(null, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts must be an object')
  })

  client.writeString({}, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.name is required')
  })

  client.writeString({
    name: 'biscuits'
  }, function(err) {
    t.type(err, Error, 'err is an Error')
    t.equal(err.message, 'opts.val is required')
  })

  client.writeString({
    name: 'test'
  , val: 'biscuits'
  }, function(err) {
    t.ifError(err, 'err should not exist')
  })
})

test('Client#_write', function(t) {
  t.plan(1)
  var client = new Client({
    host: 'http://127.0.0.1:9999'
  , db: 'write'
  })

  client._write('test', 'val=1', {
    t: 1
  }, Date.now(), function(err, res) {
    t.ifError(err, 'err is not an Error')
  })
})

test('cleanup', function(t) {
  var server = require('./server')
  server.close(function() {
    t.end()
  })
})
