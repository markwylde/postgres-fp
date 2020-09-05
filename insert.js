function objectToExecute (tableName, object) {
  const fields = Object.keys(object).map(field => `"${field}"`).join(', ');
  const parameters = Object.values(object);
  return {
    sql: `INSERT INTO ${tableName} (${fields}) VALUES (${parameters.map((_, index) => '$' + (index + 1))})`,
    parameters
  };
}

function insert (connection, tableName, object, parameters, callback) {
  if (arguments.length === 4) {
    callback = parameters;
    parameters = null;
  }

  if (!parameters) {
    parameters = [];
  }

  const parsed = objectToExecute(tableName, object);

  connection.query(parsed.sql, parsed.parameters, function (error, result) {
    if (error) {
      return callback(error);
    }

    callback(null, result);
  });
}

module.exports = insert;
