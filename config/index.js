const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config/index.json"));
// console.log(config);
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

// 服务器启动端口号
const port = config.serverPort;
// 只有两层结构的资源目录，需要特别扫描
const doubleDeckFolder = config.doubleDeckFolder;
// 游戏目录，需要特别扫描
const gameFolder = config.gameFolder;
// 默认Area
const baseArea = config.baseArea;

// 配置文件路径生成
let initLogPath = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';
let startLogPath = './logs/start ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';

module.exports.port = port;
module.exports.doubleDeckFolder = doubleDeckFolder;
module.exports.gameFolder = gameFolder;
module.exports.baseArea = baseArea;
module.exports.initLogPath = initLogPath;
module.exports.startLogPath = startLogPath;

