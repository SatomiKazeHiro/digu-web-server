const fs = require("fs");
const ResourcesDB = require("./ResourcesDB");
const UsersDB = require("./UsersDB");

const InitDBs = function ({ processKey }) {
  // 目录
  const { DATABASE_PATH } = process[processKey];
  if (!fs.existsSync(DATABASE_PATH)) {
    fs.mkdirSync(DATABASE_PATH);
  }

  // 诸数据库
  let resourcesDB = new ResourcesDB({ path: DATABASE_PATH });
  let usersDB = new UsersDB({ path: DATABASE_PATH });

  return { resourcesDB, usersDB };
};

module.exports = InitDBs;
