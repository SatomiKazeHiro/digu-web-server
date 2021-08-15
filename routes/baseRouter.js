/**
 * baseRouter处理基础页面路径请求：/、404
 */
const express = require("express");
const baseRouter = express.Router();

// 中间件
let { baseMiddleware } = require('../middleware/router');


baseRouter.get('/', baseMiddleware, (req, res) => {
  res.send("hello, express.");
})

baseRouter.get('/404', baseMiddleware, (req, res) => {
  res.send("404");
})


module.exports.baseRouter = baseRouter;
