/**
 * Created by hpq on 2018/4/28.
 */
var db = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'secretchat',
    dataStrings: true,
    connectionLimit: 25
  }
}

module.exports = db
