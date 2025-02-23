const { resolve } = require("path");
const { processKey } = require("./key-map");
const { writeConfig } = require("../tools/io-config");

const DATABASE_PATH = resolve(process.cwd(), "database");

const ConfigLoader = function (config = {}) {
  // 写入配置
  writeConfig(config);

  // 写入当前进程
  let serverConfig = {
    SERVER_PORT: config.ServerPort,
    RESOURCES_PATH: config.ResourcesPath,
    DATABASE_PATH: DATABASE_PATH,
    ROOT_USERNAME: config.RootUsername,
    ROOT_PASSWORD: config.RootPassword,
  };
  process[processKey] = serverConfig;
  return { processKey, serverConfig };
};

module.exports = ConfigLoader;
