// 引入内置模块
const path = require("path");
const process = require("process");

const express = require("express");
const server = new express();

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// 加载全局配置信息
const { configLoader } = require("./config");
configLoader();

// 加载全局方法
const tools = require("./tools");
tools.toolsLoader();
tools.sqlLoader();

// 创建状态
process.__state = new Object();
process.__state.INIT_READY = true;

process.__tools.ioLog("", "start");

// 初始化
const { init } = require("./processor");
init();

// 引用自定义路由
const baseRouter = require("./routes/baseRouter");
const dataRouter = require("./routes/dataRouter");
// const webRouter = require('./routes/webRouter');

// 静态资源设置
server.use("/sources", express.static(path.join(process.cwd() + "/sources")));

// 基础路由
server.use("/", baseRouter);

// 自定义路由
server.use("/api", dataRouter);
// server.use('/', webRouter);

server.get("*", (req, res) => {
  res.redirect("/404");
});

server.listen(process.__config.SERVER_PORT, () => {
  process.__tools.ioLog(process.__config.SERVER_PORT, "DONE");
  process.__tools.memory("/server");
});
