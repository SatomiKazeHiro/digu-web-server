/**
 * dataRouter处理资源目录请求
 */
const express = require("express");
const dataRouter = express.Router();

const indexRouter = require("./data/indexRouter");
const checkRouter = require("./data/checkRouter");
const configRouter = require("./data/configRouter")

dataRouter.use("/get", indexRouter);
dataRouter.use("/check", checkRouter);
dataRouter.use("/", configRouter);

module.exports = dataRouter;
