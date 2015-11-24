# inlean

[![Build Status](https://travis-ci.org/helpdotcom/inlean.svg)](https://travis-ci.org/helpdotcom/inlean)
[![Coverage Status](https://coveralls.io/repos/helpdotcom/inlean/badge.svg?branch=master&service=github)](https://coveralls.io/github/helpdotcom/inlean?branch=master)

Lean influxdb stats collector

## Install

```bash
$ npm install --save inlean
```

## Test

```bash
$ npm test
```

## Usage

```js
var Inlean = require('inlean')
var client = new Inlean({
  host: 'http://127.0.0.1:8086'
, db: 'biscuits'
, tags: {
    service: 'db'
  }
})
```

### Client(opts)

`opts` must be an object and can have the following properties:

- `host` the influx db host (ex. `http://localhost:8086`) [required]
- `db` the database name [optional]
- `tags` an object containing the tags to be used for every request [optional]

**Note: the db is not automatically created. Use Client#createDb to create**


### Client#setDb(name)

sets the current database


### Client#createDb(name, cb)

creates a database with the given _name_


### Client#writeFloat(opts, cb)

`opts` must be an object and can have the following properties:

- `name` the metric name [required]
- `val` the value [required]
- `tags` an object containing the tags to apply [optional]
- `ts` a timestamp [optional]


### Client#writeInt(opts, cb)

`opts` must be an object and can have the following properties:

- `name` the metric name [required]
- `val` the value [required]
- `tags` an object containing the tags to apply [optional]
- `ts` a timestamp [optional]


### Client#writeBool(opts, cb)

`opts` must be an object and can have the following properties:

- `name` the metric name [required]
- `key` the key to write (defaults to `value`) [optional]
- `val` the value [required]
  - `true` and `false` will be correctly serialized
- `tags` an object containing the tags to apply [optional]
- `ts` a timestamp [optional]


### Client#writeString(opts, cb)

`opts` must be an object and can have the following properties:

- `name` the metric name [required]
- `key` the key to write (defaults to `value`) [optional]
- `val` the value [required]
- `tags` an object containing the tags to apply [optional]
- `ts` a timestamp [optional]


## TODO

- only send in batches to limit http activity

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
