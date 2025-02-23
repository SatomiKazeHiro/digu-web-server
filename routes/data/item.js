const express = require("express");
const itemRouter = express.Router();
const { processKey } = require("../../routine/key-map");
const Response = require("../utils/response");

const {
  RESOURCES_PATH,
  _TOOLS: TOOLS,
  _DB_TOOLS: { resourcesDB },
} = process[processKey];

// 0+
const isValidNum = function (num) {
  return num && isFinite(num) && num > -1;
};

// 1+
const isGreaterThanZero = function (num) {
  return isValidNum(num) && num > 0;
};

// 获取随机资源项目内容（用于首页比较多）
itemRouter.post("/random", (req, res) => {
  try {
    let { limit, simple, area, category } = req.body;

    limit = parseInt(limit);
    if (!isValidNum(limit)) return Response.warn(res, "limit: 错误");

    let { data } = resourcesDB.getRandonItem(limit, { simple, area, category });
    Response.success(res, { data });
  } catch (error) {
    Response.error(res, error);
  }
});

// 获取随机资源项目内容（用于首页比较多）
itemRouter.post("/page", (req, res) => {
  try {
    let { pageSize, current, area, category, simple } = req.body;

    current = parseInt(current);
    if (!isGreaterThanZero(current)) return Response.warn(res, "current: 错误");
    pageSize = parseInt(pageSize);
    if (!isGreaterThanZero(pageSize)) return Response.warn(res, "pageSize: 错误");

    let { data, total } = resourcesDB.getNormalItem(current, pageSize, { simple, area, category });
    Response.success(res, { data, pageSize, current, total });
  } catch (error) {
    Response.error(res, error);
  }
});

// 获取资源详情
itemRouter.post("/detail", (req, res) => {
  try {
    let { hashId } = req.body;
    if (!hashId) return Response.warn(res, "hashId: 缺失");

    let detail = resourcesDB.getItemDetail(hashId);
    if (detail) return Response.success(res, { data: detail });
    else return Response.warn(res, "资源不存在");
  } catch (error) {
    Response.error(res, error);
  }
});

module.exports = itemRouter;
