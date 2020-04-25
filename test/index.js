const righto = require('righto');
const test = require('righto-tape');

const connect = require('../connect');
const run = require('../run');
const getAll = require('../getAll');
const getOne = require('../getOne');
const close = require('../close');

const clean = require('./helpers/clean');

const config = {
  host: 'localhost',
  username: 'postgres',
  database: 'test',
  port: 5432 // cockroach? 26257
};

test('connect', t => {
  t.plan(2);

  connect(config, function (error, connection) {
    if (error) {
      throw error;
    }

    t.ok(connection.Client);

    close(connection, function (error, closed) {
      t.notOk(error);
    });
  });
});

test('run: incorrect sql', function * (t) {
  t.plan(1);

  const connection = yield righto(connect, config);

  const incorrectSql = righto(run, connection, '_WRONG SQL');
  yield righto.handle(incorrectSql, function (error, callback) {
    t.equal(error.toString(), 'error: at or near "_wrong": syntax error');

    close(connection);
  });
});

test('run', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  const tableCreated = yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  yield righto(close, connection);

  t.ok(tableCreated);
});

test('getAll: incorrect sql', function * (t) {
  t.plan(1);

  const connection = yield righto(connect, config);

  const incorrectSql = righto(getAll, connection, '_WRONG SQL');
  yield righto.handle(incorrectSql, function (error, callback) {
    t.equal(error.toString(), 'error: at or near "_wrong": syntax error');

    close(connection);
  });
});

test('getAll: no records', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const rows = yield righto(getAll, connection, 'SELECT * FROM lorem');
  t.deepEqual(rows, []);

  yield righto(close, connection);
});

test('getAll: one record', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test\')');
  const rows = yield righto(getAll, connection, 'SELECT * FROM lorem');
  t.deepEqual(rows, [{ info: 'test' }]);

  yield righto(close, connection);
});

test('getAll: multiple records', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test1\')');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test2\')');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test3\')');
  const rows = yield righto(getAll, connection, 'SELECT * FROM lorem');
  t.deepEqual(rows, [
    { info: 'test1' },
    { info: 'test2' },
    { info: 'test3' }
  ]);

  yield righto(close, connection);
});

test('getAll: with parameters', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test1\')');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test2\')');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test3\')');
  const rows = yield righto(getAll, connection, 'SELECT * FROM lorem WHERE info = $1', ['test3']);
  t.deepEqual(rows, [
    { info: 'test3' }
  ]);

  yield righto(close, connection);
});

test('getOne: incorrect sql', function * (t) {
  t.plan(1);

  const connection = yield righto(connect, config);

  const incorrectSql = righto(getOne, connection, '_WRONG SQL');
  yield righto.handle(incorrectSql, function (error, callback) {
    t.equal(error.toString(), 'error: at or near "_wrong": syntax error');

    close(connection);
  });
});

test('getOne: no records', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const record = yield righto(getOne, connection, 'SELECT * FROM lorem');
  t.notOk(record);

  yield righto(close, connection);
});

test('getOne: one record', function * (t) {
  t.plan(1);

  yield righto(clean, config);

  const connection = yield righto(connect, config);
  yield righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  yield righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test\')');
  const record = yield righto(getOne, connection, 'SELECT * FROM lorem');
  t.deepEqual(record, { info: 'test' });

  yield righto(close, connection);
});
