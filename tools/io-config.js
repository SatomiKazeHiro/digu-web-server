const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const configPath = join(process.cwd(), "config");
const configJsonPath = join(configPath, "config.json");

const mkConfig = function () {
  if (!existsSync(configJsonPath)) {
    writeFileSync(configJsonPath, JSON.stringify({}), { encoding: "utf-8" });
  }
};

const checkConfig = function () {
  if (!existsSync(configPath)) {
    mkdirSync(configPath);
  }
  mkConfig();
};

const readConfig = function () {
  checkConfig();
  return JSON.parse(readFileSync(configJsonPath, { encoding: "utf-8" }));
};

const writeConfig = function (config = {}) {
  checkConfig();
  writeFileSync("./configs/config.json", JSON.stringify(config, null, 2), {
    encoding: "utf-8",
  });
};

module.exports = {
  configPath,
  configJsonPath,
  readConfig,
  writeConfig,
};
