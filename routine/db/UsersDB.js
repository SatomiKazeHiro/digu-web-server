const Database = require("better-sqlite3");

const connectDB = (DBPath) => {
  const DB = new Database(`${DBPath}/users.db`);
  const tableSQLs = [
    // 用户
    `CREATE TABLE IF NOT EXISTS users_index(
      uuid TEXT primary key, 
      username TEXT, 
      twitter TEXT, 
      avatar BLOB,
      create_time INTEGER,
      online_time INTEGER,
      level_type INTEGER
    )
    `,
  ];
  tableSQLs.forEach((sql) => DB.exec(sql));
  return DB;
};

class UsersDB {
  DB = null;
  constructor({ path }) {
    this.DB = connectDB(path);
  }
}
module.exports = UsersDB;
