const { Pool } = require('pg');

function connect (config, callback) {
  const pool = new Pool(config);

  callback(null, pool);
}

module.exports = connect;
