function getAll (connection, sql, parameters, callback) {
  if (arguments.length === 3) {
    callback = parameters;
    parameters = null;
  }

  if (!parameters) {
    parameters = [];
  }

  connection.query(sql, parameters, function (error, result) {
    if (error) {
      return callback(error);
    }

    callback(null, result.rows);
  });
}

module.exports = getAll;
