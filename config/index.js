const process = require("process");

const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config/index.json"));

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

let configLoader = function () {
  process.__config = new Object();
  process.__config.SERVER_PORT = config.serverPort;
  process.__config.INIT_LOG_PATH = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';
  process.__config.START_UP_LOG_PATH = './logs/start ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';
  process.__config.BASE_AREA = config.baseArea;
}

module.exports.configLoader = configLoader;
