// 内置模块
const express = require("express");
const fs = require("fs");
const path = require("path");

// 服务器输出声明
console.log('\033[44;30m INFO \033[40;34m 服务器启动中... \033[0m');

// 搭建Express轻量级Web框架
const serve = new express();

// 配置模块参数
const { port, initLogPath, startLogPath } = require("./config");

// 自定义模块方法
let { ioLog } = require('./tools/ioLog');
let { init, initSources } = require("./tools/init");
// 初始化
init();

// 自定义路由
let { baseRouter } = require('./routes/baseRouter');
let { dataRouter } = require('./routes/dataRouter');
let { webRouter } = require('./routes/webRouter');

// 静态资源设置
serve.use('/sources', express.static(path.join(__dirname + '/sources')));

// 基础路由
serve.use('/', baseRouter);

// 获取所有的area类型
serve.get("/getSource", (req, res) => {
  // 配置文件不存在，则提示并初始化
  if (!fs.existsSync("./sources/sources.config.json")) {
    ioLog(initLogPath, '[!] /sources/sources.config.config -> null', 'warning');
    initSources();
  }
  let areaArr = (JSON.parse(fs.readFileSync('./sources/sources.config.json')).dir);
  if (areaArr.length > 0) res.send({ code: 200, data: areaArr });
  else res.send({ code: 0 });
})

// 自定义路由
serve.use('/api', dataRouter);
serve.use('/', webRouter);

serve.get('*', (req, res) => {
  res.redirect("/404");
})


serve.listen(port, () => {
  ioLog(startLogPath, port, 'DONE')
})
