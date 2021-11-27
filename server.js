// 内置模块
const express = require("express");
const fs = require("fs");
const path = require("path");

const process = require("process")


// 服务器输出声明
console.log('\033[44;30m INFO \033[40;34m 服务器启动中... \033[0m');

// 搭建Express轻量级Web框架
const server = new express();

// 配置模块参数
const { port, startLogPath } = require("./config");

// 引用自定义路由
let { baseRouter } = require('./routes/baseRouter');
let { dataRouter } = require('./routes/dataRouter');
let { webRouter } = require('./routes/webRouter');

// 自定义模块方法
let ioLog = require('./tools/ioLog');
let init = require("./tools/init");
// 初始化
init()

// 静态资源设置
server.use('/sources', express.static(path.join(__dirname + '/sources')));

// 基础路由
server.use('/', baseRouter);

// 自定义路由
server.use('/api', dataRouter);
server.use('/', webRouter);

server.get('*', (req, res) => {
  res.redirect("/404");
})


server.listen(port, () => {
  ioLog(startLogPath, port, 'DONE')

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/server => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

})

