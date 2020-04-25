const { Client } = require('pg');

function clean (config, callback) {
  const client = new Client(config);
  client.connect();
  client.query('DROP TABLE lorem', function (error, result) {
    client.end();
    if (error && error.includes('does not exist')) {
      return callback();
    }

    if (error) {
      return callback(error);
    }

    callback();
  });
}

module.exports = clean;
