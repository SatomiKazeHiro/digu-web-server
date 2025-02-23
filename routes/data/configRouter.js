/**
 * 配置信息的路由
 */
const process = require("process");

const express = require("express");
const configRouter = express.Router();

// 路由中间件
// const { dataMiddleware } = require("../../middleware");

// 资源数据库工具
const SqlTool = process.__sql.SOURCES_SQL_TOOL;

// post 方法处理
var bodyParser = require("body-parser");
// 添加json解析
configRouter.use(bodyParser.json());
configRouter.use(bodyParser.urlencoded({ extended: false }));

// 生成目录树
configRouter.get("/getLogtree", (req, res) => {
  let resArr = [];
  SqlTool.getAreas(false).forEach((i) => {
    i.children = [];
    i.label = i.area;
    delete i.area;
    let tempCs = SqlTool.getCategories(i.label, false);
    tempCs.forEach((c) => {
      c.label = c.category;
      delete c.category;
      i.children.push(c);
    });
    resArr.push(i);
  });
  res.send({ code: 200, data: resArr });
});

// 获取 area 的配置信息
configRouter.get("/getAreaIndex", (req, res) => {
  if (req.query.area) {
    let resObj = SqlTool.getAreaMsg(req.query.area);
    res.send({ code: 200, data: resObj });
  } else res.send({ code: 400, msg: "area为空" });
});

// 获取 category 的配置信息
configRouter.get("/getCategoryIndex", (req, res) => {
  if (!req.query.area) res.send({ code: 400, msg: "area为空" });
  else if (!req.query.category) res.send({ code: 400, msg: "category为空" });
  else {
    let resObj = SqlTool.getCategoryMsg(req.query.area, req.query.category);
    res.send({ code: 200, data: resObj });
  }
});

// 设置 area
configRouter.post("/setAreaIndex", (req, res) => {
  if (req.body) {
    if (SqlTool.update("areas_index", req.body)) {
      res.send({ code: 200 });
    } else res.send({ code: 400, msg: "数据库操作出现错误" });
  } else res.send({ code: 400, msg: "参数错误" });
});

// 设置 category
configRouter.post("/setCategoryIndex", (req, res) => {
  if (req.body) {
    if (SqlTool.update("categories_index", req.body)) {
      res.send({ code: 200 });
    } else res.send({ code: 400, msg: "数据库操作出现错误" });
  } else res.send({ code: 400, msg: "参数错误" });
});

// 获取资源合法性
configRouter.post("/getSourecesValidity", (req, res) => {
  console.log("/get/sourecesValidity", req.body);
  if (req.body) {
    let bool = null;
    let { area: a, category: c, resourceId: id } = req.body;
    if (a && c) bool = SqlTool.findCategory(a, c);
    else if (a) bool = SqlTool.findArea(a);
    else if (id) bool = SqlTool.findItem(id);

    if (bool == null) return res.send({ code: 400, msg: "参数为空" });
    else return res.send({ code: bool ? 200 : 400, data: bool });
  } else res.send({ code: 400, msg: "参数错误：body不存在" });
});

module.exports = configRouter;
