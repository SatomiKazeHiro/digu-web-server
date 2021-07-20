/**
 * dataRouter处理网页页面路径请求
 */
const express = require("express");
const webRouter = express.Router();

// 中间件
const { webMiddleware } = require('../middleware/router');


webRouter.get('/:area', webMiddleware, (req, res) => {
  res.send(req.params);
})

webRouter.get('/:area/:category', webMiddleware, (req, res) => {
  res.send(req.params);
})

webRouter.get('/:area/:category/:itemId', webMiddleware, (req, res) => {
  res.send(req.params);
})

module.exports = webRouter;
