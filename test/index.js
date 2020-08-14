const righto = require('righto');
const test = require('tape');

const connect = require('../connect');
const run = require('../run');
const insert = require('../insert');
const getAll = require('../getAll');
const getOne = require('../getOne');
const close = require('../close');

const clean = require('./helpers/clean');

// COCKROACH
const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'postgres',
  port: 26257
};

// // POSTGRES
// const config = {
//   host: 'localhost',
//   user: 'postgres',
//   password: 'password',
//   database: 'test',
//   port: 5432
// };

test('connect', function (t) {
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

test('run: incorrect sql', function (t) {
  t.plan(1);

  connect(config, function (error, connection) {
    if (error) {
      throw error;
    }

    run(connection, '_WRONG SQL', function (error, connection) {
      t.ok(error.toString().includes('syntax error'));
    });
  });
});

test('run', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const closed = righto(close, connection, righto.after(tableCreated));
  const result = righto.mate(tableCreated, righto.after(closed));

  result(function (error, tableCreated) {
    t.notOk(error);
    t.ok(tableCreated);
  });
});

test('run with parameters', function (t) {
  t.plan(3);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const recordInserted = righto(run, connection, 'INSERT INTO lorem (info) VALUES ($1)', ['test'], righto.after(tableCreated));
  const closed = righto(close, connection, righto.after(recordInserted));
  const result = righto.mate(tableCreated, recordInserted, righto.after(closed));

  result(function (error, tableCreated, recordInserted) {
    t.notOk(error);
    t.ok(tableCreated);
    t.ok(recordInserted);
  });
});

test('insert object', function (t) {
  t.plan(3);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const recordInserted = righto(insert, connection, 'lorem', { info: 'test' }, righto.after(tableCreated));
  const closed = righto(close, connection, righto.after(recordInserted));
  const result = righto.mate(tableCreated, recordInserted, righto.after(closed));

  result(function (error, tableCreated, recordInserted) {
    t.notOk(error);
    t.ok(tableCreated);
    t.ok(recordInserted);
  });
});

test('insert object - invalid table', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const recordInserted = righto(insert, connection, 'wopps', {});
  const closed = righto(close, connection, righto.after(recordInserted));
  const result = righto.mate(recordInserted, righto.after(closed));

  result(function (error, recordInserted) {
    t.ok(error);
    t.notOk(recordInserted);
  });
});

test('getAll: incorrect sql', function (t) {
  t.plan(1);

  connect(config, function (error, connection) {
    if (error) {
      throw error;
    }

    getAll(connection, '_WRONG SQL', function (error, connection) {
      t.ok(error.toString().includes('syntax error'));
    });
  });
});

test('getAll: no records', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const rows = righto(getAll, connection, 'SELECT * FROM lorem', righto.after(tableCreated));
  const closed = righto(close, connection, righto.after(rows));
  const result = righto.mate(rows, righto.after(closed));

  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(rows, []);
  });
});

test('getAll: one record', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const inserted = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test\')', righto.after(tableCreated));
  const rows = righto(getAll, connection, 'SELECT * FROM lorem', righto.after(inserted));
  const closed = righto(close, connection, righto.after(rows));
  const result = righto.mate(rows, righto.after(closed));

  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(rows, [{ info: 'test' }]);
  });
});

test('getAll: multiple records', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const inserted = righto.all([
    righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test1\')', righto.after(tableCreated)),
    righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test2\')', righto.after(tableCreated)),
    righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test3\')', righto.after(tableCreated))
  ]);

  const rows = righto(getAll, connection, 'SELECT * FROM lorem', righto.after(inserted));
  const closed = righto(close, connection, righto.after(rows));

  const result = righto.mate(rows, righto.after(closed));
  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(
      rows.sort((a, b) => a.info < b.info ? -1 : 0),
      [
        { info: 'test1' },
        { info: 'test2' },
        { info: 'test3' }
      ]);
  });
});

test('getAll: with parameters', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');

  const insert1 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test1\')', righto.after(tableCreated));
  const insert2 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test2\')', righto.after(insert1));
  const insert3 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test3\')', righto.after(insert2));

  const rows = righto(getAll, connection, 'SELECT * FROM lorem WHERE info = $1', ['test3'], righto.after(insert3));

  const closed = righto(close, connection, righto.after(rows));

  const result = righto.mate(rows, righto.after(closed));
  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(rows, [
      { info: 'test3' }
    ]);
  });
});

test('getOne: incorrect sql', function (t) {
  t.plan(1);

  connect(config, function (error, connection) {
    if (error) {
      throw error;
    }

    getOne(connection, '_WRONG SQL', function (error, connection) {
      t.ok(error.toString().includes('syntax error'));
    });
  });
});

test('getOne: no records', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const rows = righto(getOne, connection, 'SELECT * FROM lorem', righto.after(tableCreated));
  const closed = righto(close, connection, righto.after(rows));
  const result = righto.mate(rows, righto.after(closed));

  result(function (error, rows) {
    t.notOk(error);
    t.notOk(rows);
  });
});

test('getOne: one record', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');
  const inserted = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test\')', righto.after(tableCreated));
  const rows = righto(getOne, connection, 'SELECT * FROM lorem', righto.after(inserted));
  const closed = righto(close, connection, righto.after(rows));
  const result = righto.mate(rows, righto.after(closed));

  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(rows, { info: 'test' });
  });
});

test('getOne: with parameters', function (t) {
  t.plan(2);

  const cleaned = righto(clean, config);
  const connection = righto(connect, config, righto.after(cleaned));
  const tableCreated = righto(run, connection, 'CREATE TABLE lorem (info TEXT)');

  const insert1 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test1\')', righto.after(tableCreated));
  const insert2 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test2\')', righto.after(insert1));
  const insert3 = righto(run, connection, 'INSERT INTO lorem (info) VALUES (\'test3\')', righto.after(insert2));

  const rows = righto(getOne, connection, 'SELECT * FROM lorem WHERE info = $1', ['test3'], righto.after(insert3));

  const closed = righto(close, connection, righto.after(rows));

  const result = righto.mate(rows, righto.after(closed));
  result(function (error, rows) {
    t.notOk(error);
    t.deepEqual(rows, { info: 'test3' });
  });
});
