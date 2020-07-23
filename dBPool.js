const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "e11wl4mksauxgu1w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "sw8t5mgd83q5jg63",
  password: "b9tessjawdkd4fxs",
  database: "n015qhnfqg7mwwau",
});

module.exports = pool;