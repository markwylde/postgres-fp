function close (connection, callback) {
  connection.end(callback);
}

module.exports = close;
