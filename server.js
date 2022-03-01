// 内置模块
const path = require("path");

const express = require("express");
const server = new express();

// 配置模块参数
const port = require("./config").port;

// 自定义模块方法
let ioLog = require('./tools/ioLog');
let init = require("./tools/init");
let memoryTool = require("./tools/memoryTool")

ioLog('', 'start');
// 初始化程序
init();

// 引用自定义路由
let { baseRouter } = require('./routes/baseRouter');
let { dataRouter } = require('./routes/dataRouter');
let { webRouter } = require('./routes/webRouter');


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
  ioLog(port, 'DONE')
  memoryTool('/server');
})

