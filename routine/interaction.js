const fs = require("fs");
const path = require("path");

const inquirer = require("inquirer");
const { readConfig } = require("../tools/io-config");

const validateMap = {
  port: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/g,
};
const lastConfig = readConfig();

const res = {};
const prompts = [
  {
    type: "input",
    name: "ServerPort",
    message: "启动端口：",
    default: lastConfig.ServerPort || 3000,
    validate: (port) => {
      port = String(port);
      if (port && port.match(validateMap.port)) return true;
      else return "请输入正确的端口号";
    },
  },
  {
    type: "input",
    name: "ResourcesPath",
    message: "资源路径：",
    default: (() => lastConfig.ResourcesPath || path.resolve(process.cwd(), "resources"))(),
    validate: (route) => {
      if (fs.existsSync(route)) return true;
      else return "请输入正确地址";
    },
  },
  {
    type: "input",
    name: "RootUsername",
    message: "配置管理员账号：",
    default: "admin",
    validate: (username) => {
      if (!username || username.length < 4) return "请输入至少4个字的用户名";
      else return true;
    },
  },
  {
    type: "password",
    name: "RootPassword",
    message: "配置管理员密码：",
    default: "123456",
    validate: (pw) => {
      if (!pw || pw.length < 6) return "请输入至少6个字的密码";
      else return true;
    },
  },
  {
    type: "password",
    name: "RePassword",
    message: "重复确认密码：",
    default: "123456",
    validate: (pw) => {
      if (!pw || pw.length < 6) return "请输入至少6个字的密码";
      else return true;
    },
  },
];

const Interaction = function (index) {
  index = index || 0;
  let prompt = prompts[index];
  return inquirer
    .prompt(prompt)
    .then((answers) => {
      res[prompt.name] = answers[prompt.name];

      // 管理员密码校验
      if (prompt.name == "RePassword" && res.RootPassword !== res.RePassword) {
        let i = prompts.findIndex((p) => p.name === "RootPassword");
        prompts[i].message = "重复密码不通过，请重新配置管理员密码：";
        index = i;
        return Interaction(index);
      } else {
        delete res.RePassword;
      }

      if (++index === prompts.length) return Promise.resolve(res);
      else return Interaction(index);
    })
    .catch((error) => {
      // console.log("\033[41;30m ERROR \033[40;31m " + error);
      console.log("## Interaction ##");
      return Promise.reject(error);
    });
};

module.exports = Interaction;
