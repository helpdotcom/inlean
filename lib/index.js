'use strict'

var request = require('request')
var assert = require('assert')
var url = require('url')
var extend = require('util')._extend

module.exports = Client

function Client(opts) {
  if (!(this instanceof Client))
    return new Client(opts)

  assert(opts, 'opts is required')
  assert(opts.host, 'opts.host is required')

  this.opts = opts
  var tags = opts.tags || {}
  this.tags = typeof tags === 'object'
    ? tags
    : null

  var parsed = url.parse(opts.host)
  this.host = parsed.protocol + '//' + parsed.host

  this.db = opts.db
}

Client.prototype.setDb = function setDb(db) {
  if (typeof db !== 'string')
    throw new TypeError('db must be a string')

  this.db = db
}

Client.prototype.createDb = function createDb(name, cb) {
  if (!name)
    return cb && cb(new Error('name is required'))

  var opts = {
    uri: this.host + '/query'
  , qs: {
      q: 'CREATE DATABASE ' + name
    }
  , json: true
  }

  request.get(opts, function(err, res, body) {
    if (err) return cb && cb(err)
    var code = res.statusCode
    if (code !== 200) {
      var err = new Error('Received non-200 status code')
      err.code = code
      err.body = body
      return cb && cb(err)
    }

    if (body && body.results) {
      var results = body.results
      if (results.length === 1) {
        var r = results[0]
        if (r.error) {
          return cb && cb(new Error(r.error))
        }
      }
    }

    cb && cb()
  })
}

// write raw data
Client.prototype.write = function write(data, cb) {
  if (typeof data !== 'string' && !Buffer.isBuffer(data))
    return cb && cb(new TypeError('data must be a string or buffer'))

  var body = new Buffer(data)
  var opts = {
    uri: this.host + '/write'
  , body: body
  , qs: {
      db: this.db
    }
  }

  request.post(opts, function(err, res, body) {
    if (err) return cb && cb(err)
    var code = res.statusCode
    if (code === 204) {
      // success
      return cb && cb()
    } else if (code === 200) {
      var err = new Error('request understood, but not written')
      err.body = body
      err.code = code
      return cb && cb(err)
    } else {
      var err = new Error('request failed')
      err.body = body
      err.code = code
      return cb && cb(err)
    }
  })
}

Client.prototype.writeFloat = function writeFloat(opts, cb) {
  if (!cbCheck(opts, cb))
    return

  var meas = opts.name
  var tags = opts.tags || {}
  var val = 'value=' + opts.val
  var str = escape(meas)

  this._write(meas, val, tags, opts.ts, cb)
}

Client.prototype.writeInt = function writeInt(opts, cb) {
  if (!cbCheck(opts, cb))
    return

  var meas = opts.name
  var tags = opts.tags || {}
  var val = 'value=' + opts.val + 'i'

  this._write(meas, val, tags, opts.ts, cb)
}

Client.prototype.writeBool = function writeBool(opts, cb) {
  if (!cbCheck(opts, cb))
    return

  var meas = opts.name
  var tags = opts.tags || {}
  var val = opts.val
  var key = opts.key || 'value'
  if (typeof val !== 'string') {
    val = String(val)
  }

  val = key + '=' + val

  this._write(meas, val, tags, opts.ts, cb)
}

Client.prototype.writeString = function writeString(opts, cb) {
  if (!cbCheck(opts, cb))
    return

  var meas = opts.name
  var tags = opts.tags || {}
  var val = opts.val
  var key = opts.key || 'value'
  val = key + '=' + val

  this._write(meas, val, tags, opts.ts, cb)
}

Client.prototype._write = function(name, val, tags, ts, cb) {
  var str = escape(name)
  var tags_ = extend({}, tags)
  extend(tags, tags_)
  if (tags) {
    str += objectToTags(tags)
  }

  str += ' ' + val

  if (ts) {
    str += ' ' + ts
  }

  this.write(str, cb)
}

function objectToTags(obj) {
  var keys = Object.keys(obj)
  var len = keys.length
  if (!len) return ''
  var str = ''
  for (var i = 0; i < len; i++) {
    str += keys[i] + '=' + escape(obj[keys[i]])
  }
  if (str) str = ',' + str
  return str
}

function escape(str) {
  if (str) {
    if (typeof str === 'string') {
      str = str.replace(/\s/g, '\\ ')
      str = str.replace(/\"/g, '\\"')
    }
  }

  return str
}

function cbCheck(opts, cb) {
  if (!opts || typeof opts !== 'object') {
    cb(new TypeError('opts must be an object'))
    return false
  }

  if (!opts.name) {
    cb(new Error('opts.name is required'))
    return false
  }

  if (!opts.val) {
    cb(new Error('opts.val is required'))
    return false
  }

  return true
}
