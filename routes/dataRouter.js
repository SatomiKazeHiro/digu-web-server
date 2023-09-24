/**
 * dataRouter处理资源目录请求
 */
const express = require("express");
const dataRouter = express.Router();

const indexRouter = require("./data/indexRouter");
const configRouter = require("./data/configRouter");

dataRouter.use("/get", indexRouter);
dataRouter.use("/cfg", configRouter);

module.exports = dataRouter;
