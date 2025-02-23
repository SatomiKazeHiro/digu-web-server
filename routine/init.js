const ToolLoader = require("./tool-loader");
const InitDBs = require("./db");
const ResourceLoader = require("./resource-loader");

const Init = function ({ processKey }) {
  return new Promise((resolve, reject) => {
    if (process[processKey]) {
      // step.1: 全局工具
      ToolLoader({ processKey });

      // step.2: 数据库
      const DBs = InitDBs({ processKey });
      process[processKey]._DB_TOOLS = DBs;

      // step.3: 遍历目录和写入数据库
      ResourceLoader({ processKey })
        .then(() => resolve())
        .catch((err) => reject(err));
    } else {
      reject(new Error("缺少进程标记属性"));
    }
  });
};

module.exports = Init;
