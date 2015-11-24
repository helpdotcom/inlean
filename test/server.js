'use strict'

var http = require('http')
var url = require('url')
var qs = require('querystring')

var server = http.createServer(handle)

module.exports = server

function handle(req, res) {
  var method = req.method
  var u = url.parse(req.url)

  if (u.pathname === '/query') {
    // create
    return handleCreate(u, req, res)
  } else if (u.pathname === '/write') {
    return handleWrite(u, req, res)
  }

  res.end()
}

function handleCreate(u, req, res) {
  var q = qs.parse(u.query)

  if (q.q === 'CREATE DATABASE SUCCESS') {
    writeJSON(res, {})
  } else if (q.q === 'CREATE DATABASE ERROR') {
    writeJSON(res, {
      results: [{
        error: 'something went wrong'
      }]
    })
  } else if (q.q === 'CREATE DATABASE NOPE') {
    res.writeHead(400, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({}))
  } else {
    res.end()
  }
}

function handleWrite(u, req, res) {
  var q = qs.parse(u.query)
  var db = q.db

  var buf = ''
  req.on('data', function(chunk) {
    buf += chunk
  })

  req.on('end', function() {
    var code
    if (!isNaN(buf)) {
      code = +buf
    } else {
      code = 204
    }

    res.writeHead(code, {
      'Content-Type': 'application/json'
    })
    res.end()
  })
}

function writeJSON(res, body) {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })

  res.end(JSON.stringify(body))
}
