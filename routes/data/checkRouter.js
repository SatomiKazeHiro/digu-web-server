/**
 * 检测用的路由
 */
const process = require("process");

const express = require("express");
const checkRouter = express.Router();

// 路由中间件
const { dataMiddleware } = require('../../middleware');

// 数据库工具
const SqlTool = process.__class.SqlTool;


// 检测是否有指定域
checkRouter.get('/area', (req, res) => {
  let resBoolean = SqlTool.findArea(req.query.area);
  res.send({ code: 200, data: resBoolean });
})

// 检测是否有指定类
checkRouter.get('/category', (req, res) => {
  let resBoolean = SqlTool.findCategory(req.query.area, req.query.category);
  res.send({ code: 200, data: resBoolean });
})

// 检测是否有指定资源项目
checkRouter.get('/item', (req, res) => {
  let resBoolean = SqlTool.findItem(req.query.id)
  res.send({ code: 200, data: resBoolean });
})

module.exports = checkRouter;
