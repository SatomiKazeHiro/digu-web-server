/**
 * 配置信息的路由
 */
const fs = require("fs");

const express = require("express");
const configRouter = express.Router();

// 路由中间件
const { dataMiddleware } = require('../../middleware');

// 数据库工具
const SqlTool = require('../../tools/SqlTool');


// 生成目录树
configRouter.get('/get/logtree', (req, res) => {
  let resArr = [];
  SqlTool.getAreas(false).forEach(i => {
    i.children = [];
    i.label = i.area;
    delete i.area;
    let tempCs = SqlTool.getCategories(i.label, false);
    tempCs.forEach(c => {
      c.label = c.category;
      delete c.category;
      i.children.push(c)
    })
    resArr.push(i);
  })
  res.send({ code: 200, data: resArr })
})

// 获取 area 的配置信息
configRouter.get('/get/areaIndex', (req, res) => {
  if (req.query.area) {
    let resObj = SqlTool.getAreaMsg(req.query.area);
    res.send({ code: 200, data: resObj })
  } else res.send({ code: 400, msg: "area为空" })
})

// 获取 category 的配置信息
configRouter.get('/get/categoryIndex', (req, res) => {
  if (!req.query.area) res.send({ code: 400, msg: "area为空" });
  else if (!req.query.category) res.send({ code: 400, msg: "category为空" });
  else {
    let resObj = SqlTool.getCategoryMsg(req.query.area, req.query.category);
    res.send({ code: 200, data: resObj });
  }
})

// 设置 area
configRouter.get('/set/areaIndex', (req, res) => {
  if (req.query.areaObj) {
    if (SqlTool.update('areas_index', JSON.parse(req.query.areaObj))) {
      res.send({ code: 200 });
    }
    else res.send({ code: 400, msg: "数据库操作出现错误" })
  } else res.send({ code: 400, msg: "参数错误" })
})

// 设置 category
configRouter.get('/set/categoryIndex', (req, res) => {
  if (req.query.categoryObj) {
    if (SqlTool.update('categories_index', JSON.parse(req.query.categoryObj))) {
      res.send({ code: 200 });
    }
    else res.send({ code: 400, msg: "数据库操作出现错误" })
  } else res.send({ code: 400, msg: "参数错误" })
})

module.exports = configRouter;
