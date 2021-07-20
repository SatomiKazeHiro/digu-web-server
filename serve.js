// 内置模块
const express = require("express");
const fs = require("fs");
const path = require("path");

// 服务器输出声明
console.log('\033[44;30m INFO \033[40;34m 服务器启动中... \033[0m');

// 内置模块的使用
const serve = new express();

// 配置模块
const { port, initLogPath, startLogPath } = require("./config");

// 自定义模块方法
const { ioLog } = require('./tools/ioLog');
const { init, init_sources } = require("./tools/init");
init();

// 路由
let dataRouter = require('./routes/dataRouter');
let webRouter = require('./routes/webRouter');

// 基本路由
serve.get('/', (req, res) => {
  res.send("hello, express.");
})

serve.get('/404', (req, res) => {
  res.send("404");
})

// 静态资源
serve.use('/sources', express.static(path.join(__dirname + '/sources')));

// 获取所有的area类型
serve.get("/getSource", (req, res) => {
  // 配置文件不存在，则提示并初始化
  if (!fs.existsSync("./sources/sources.log.json")) {
    ioLog(initLogPath, '[!] /sources/sources.log.config -> null', 'warning');
    init_sources();
  }
  let areaArr = (JSON.parse(fs.readFileSync('./sources/sources.log.json')).dir);
  if (areaArr.length > 0) res.send({ code: 1, data: areaArr });
  else res.send({ code: 0 });
})

// 特殊路由
serve.use('/data', dataRouter);
serve.use('/', webRouter);

serve.get('*', (req, res) => {
  res.redirect("/404-1");
})


serve.listen(port, () => {
  ioLog(startLogPath, port, 'DONE')
})
