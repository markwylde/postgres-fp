# postgres-fp
[![Build Status](https://travis-ci.org/markwylde/postgres-fp.svg?branch=master)](https://travis-ci.org/markwylde/postgres-fp)
[![David DM](https://david-dm.org/markwylde/postgres-fp.svg)](https://david-dm.org/markwylde/postgres-fp)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/markwylde/postgres-fp)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/markwylde/postgres-fp)](https://github.com/markwylde/postgres-fp/releases)
[![GitHub](https://img.shields.io/github/license/markwylde/postgres-fp)](https://github.com/markwylde/postgres-fp/blob/master/LICENSE)

A wrapper around postgres in a functional programming style

## Installation
```bash
npm install --save postgres-fp
```

## Example
### With [righto](https://github.com/KoryNunn/righto)
```javascript
const righto = require('righto')
const connect = require('postgres-fp/connect')
const execute = require('postgres-fp/execute')
const getAll = require('postgres-fp/getAll')

const connection = righto(connect, {
  hostname: 'localhost',
  port: 1000
})
const tableCreated = righto(execute, connection, 'CREATE TABLE lorem (info TEXT)')
const testResults = righto(getAll, connection, 'SELECT * FROM test', righto.after(tableCreated))

testResults(function (error, results) {
  if (error) {
    throw error
  }

  console.log(results)
})
```

### With promises
```javascript
const postgres = require('postgres-fp/promises');

async function getTestRecords () {
  const connection = await postgres.connect({
    hostname: 'localhost',
    port: 1000
  });

  await postgres.execute(connection, 'CREATE TABLE lorem (info TEXT)');

  const results = await postgres.getAll(connection, 'SELECT * FROM test');

  console.log(results);
}
```

## Functions signatures
### connect -> filename -> [mode] -> (error, connection)
### run -> connection -> sql -> [parameters] -> (error, result={lastId, changes})
### insert -> connection -> tableName -> object -> (error, result={lastId, changes})
### getAll -> connection -> sql -> (error, rows)
### getOne -> connection -> sql -> (error, row)
### batch (not implemented yet)
### close -> connection -> (error)

## License
This project is licensed under the terms of the MIT license.
