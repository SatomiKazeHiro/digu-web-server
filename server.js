// 引入内置模块
const path = require("path");
const process = require("process");

const express = require("express");
const server = new express();

// 加载全局配置信息
const configLoader = require("./config").configLoader;
configLoader();

// 加载全局方法
const tools = require("./tools");
tools.funcLoader();
tools.classLoader();

process.__state = new Object();
process.__state.INIT_READY = true;

process.__func.ioLog('', 'start');
process.__func.init();

// 引用自定义路由
const baseRouter = require('./routes/baseRouter');
const dataRouter = require('./routes/dataRouter');
// const webRouter = require('./routes/webRouter');

// 静态资源设置
server.use('/sources', express.static(path.join(__dirname + '/sources')));

// 基础路由
server.use('/', baseRouter);

// 自定义路由
server.use('/api', dataRouter);
// server.use('/', webRouter);

server.get('*', (req, res) => {
  res.redirect("/404");
})

server.listen(process.__config.SERVER_PORT, () => {
  process.__func.ioLog(process.__config.SERVER_PORT, 'DONE')
  process.__func.memory('/server');
})

