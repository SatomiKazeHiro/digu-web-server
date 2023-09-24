const fs = require("fs");
const process = require("process");

// 配置文件
let config;

if (!fs.existsSync("./config/config.json")) {
  config = {
    serverPort: 2233,
    baseArea: ["anime", "manga"],
  };
  let data = JSON.stringify(config, null, "\t");
  fs.mkdirSync("config");
  fs.writeFileSync("./config/config.json", data, { encoding: "utf-8" });
}

config = config || JSON.parse(fs.readFileSync("./config/config.json"));

// 检测数据库目录
if (!fs.existsSync("./db")) {
  fs.mkdirSync("./db");
}

// {
//   "serverPort": 2233,
//   "baseArea": [
//     "anime",
//     "manga",

//     "movie",

//     "video",
//     "music",
//     "illustration",
//     "ebook",
//     "allum"
//   ],
//   "doubleDeckFolder": [
//     "video",
//     "music",
//     "illustration",
//     "ebook",
//     "allum"
//   ],
//   "gameFolder": [
//     "game"
//   ]
// }

// 只有两层结构的资源目录，需要特别扫描
// const doubleDeckFolder = config.doubleDeckFolder;
// // 游戏目录，需要特别扫描
// const gameFolder = config.gameFolder;

let currentMonth = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);

let configLoader = function () {
  process.__config = new Object();
  process.__config.SERVER_PORT = config.serverPort;
  process.__config.INIT_LOG_PATH = "./logs/init " + currentMonth + ".log";
  process.__config.START_UP_LOG_PATH = "./logs/start " + currentMonth + ".log";
  process.__config.BASE_AREA = config.baseArea;
};

module.exports.configLoader = configLoader;
