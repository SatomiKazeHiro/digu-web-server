/**
 * 资源数据库的功能库
 */
const Database = require("better-sqlite3");
const db = new Database("./db/user.db");

module.exports = class UserDB {

};
