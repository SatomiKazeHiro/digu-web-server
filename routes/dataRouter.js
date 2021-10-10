/**
 * dataRouter处理资源目录请求
 */
// 内置模块引用
const express = require("express");
const fs = require("fs");

const process = require("process")

// 创建路由实例
const dataRouter = express.Router();

// 路由中间件
let { dataMiddleware } = require('../middleware/router');

let SqlTool = require('../tools/SqlTool');

// 获取某个域下随机的内容
// 未来增加：去除特定分类内容
dataRouter.get('/get/areaRandom', dataMiddleware, (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/areaRandom => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, limit } = req.query;
  // 字符串数据处理
  limit = parseInt(limit)
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" });
    return;
  }

  // 从内存获取域下所有资源目录的集合
  let itemIds = SqlTool.getItemsByArea(area);
  // 计算总数
  let total = itemIds.length;
  // 判断分页量的有效性
  if (limit > total) limit = total;

  // 返回对象
  let resArr = [];
  while (true) {
    // 从最大数量中获取随机数
    let index = itemIds.length * Math.random() << 0;
    // 在封装对象之前先判断返回对象是否包含了该项，包含了则跳过
    if (resArr.map(i => i.id).includes(itemIds[index])) {
      continue;
    }
    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    let url = SqlTool.getItemUrl(itemObj.id);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      url
    });

    if (resArr.length == limit) break;
  }
  res.send({ code: 200, data: resArr })
})

// 获取某个域的所有内容
// 未来增加：去除特定分类内容
dataRouter.get('/get/areaNormal', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/areaNormal => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, limit, page } = req.query;
  // console.log(area, limit, page);

  // 字符串数据处理
  limit = parseInt(limit);
  page = parseInt(page)
  // 检测limit和page的合理性
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" });
    return;
  }
  if (typeof (page) == "undefined" || isNaN(page) || page < 1) {
    res.send({ code: 400, msg: "page错误" });
    return;
  }

  // 获取该域下所有资源目录id的内容
  let iIdArr = SqlTool.getItemsByArea(area);

  // 通过所有资源目录id的total总数和limit限制计算总页数pageTotal
  let total = iIdArr.length;
  let pageTotal = Math.ceil(total / limit);
  // 检测page的有效性
  if (page > pageTotal) page = pageTotal;
  // 判断limit的有效性
  if (limit > total) limit = total;

  // 数据集合
  let resArr = [];
  // 分页开始、结束位置
  let pageStart = limit * (page - 1);
  let pageEnd = total - limit * (page - 1) <= limit ? total : limit * page;

  for (let i = pageStart; i < pageEnd; i++) {
    let readObj = SqlTool.getItemMsg(iIdArr[i]);
    let url = SqlTool.getItemUrl(readObj.id);
    resArr.push({
      id: readObj.id,
      cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
      title: readObj.title,
      url
    });
  }

  res.send({ code: 200, data: { total, page, resArr } })
})

// 获取指定域下分类的随机内容
dataRouter.get('/get/categoryRandom', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryRandom => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, category, limit } = req.query;

  // 读取category内容的数组，从中确认是否有该category
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 字符串数据处理
  limit = parseInt(limit);
  // 检测limit的合理性
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1)
    res.send({ code: 400, msg: "limit错误" });

  // 获取该category下的资源目录内容
  let itemIds = SqlTool.getItemsByAC(area, category);
  // 检查limit的范围
  if (limit > itemIds.length) limit = itemIds.length;

  // 返回数组
  let resArr = [];
  // 设置基础文件路径
  let basePath = `./sources/${area}/${category}/`;

  while (true) {
    // 从最大数量中获取随机数
    let index = itemIds.length * Math.random() << 0;
    // 判断封装数组是否重复
    if (resArr.map(i => i.id).includes(itemIds[index])) {
      continue;
    }

    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      url: basePath
    });

    if (resArr.length == limit) break;
  }

  res.send({ code: 200, data: resArr })
})

// 获取指定域下分类的所有内容
dataRouter.get('/get/categoryNormal', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryNormal => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, category, limit, page } = req.query;

  // 字符串数据处理
  limit = parseInt(limit);
  page = parseInt(page)
  // 检测limit和page的合理性
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" })
    return;
  }
  if (typeof (page) == "undefined" || isNaN(page) || page < 1) {
    res.send({ code: 400, msg: "page错误" });
    return;
  }

  // 读取category内容的数组，从中确认是否有该category
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 获取该category下的资源目录内容
  let iIdArr = SqlTool.getItemsByAC(area, category);

  // 通过所有资源目录id的total总数和limit限制计算总页数pageTotal
  let total = iIdArr.length;
  let pageTotal = Math.ceil(total / limit);
  // 检测page合理性
  if (page > pageTotal) page = pageTotal;
  // 判断limit的有效性
  if (limit > total) limit = total;

  // 数据集合
  let resArr = [];
  // 设置基础文件路径
  let basePath = `./sources/${area}/${category}/`;
  // 分页开始、结束位置
  let pageStart = limit * (page - 1);
  let pageEnd = total - limit * (page - 1) <= limit ? total : limit * page;

  for (let i = pageStart; i < pageEnd; i++) {
    let readObj = SqlTool.getItemMsg(iIdArr[i]);
    resArr.push({
      id: readObj.id,
      cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
      title: readObj.title,
      url: basePath
    });
  }

  res.send({ code: 200, data: resArr })

})

// 获取项目内容
dataRouter.get('/get/item', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/item => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 校验资源目录id是否存在
  if (!SqlTool.findItem(req.query.id)) {
    res.send({ code: 400, msg: "id错误" })
    return;
  }

  // 该资源目录id的基本路径
  let basePath = SqlTool.getItemUrl(req.query.id, true);
  // 读取配置信息
  let readConfigObj = JSON.parse(fs.readFileSync(basePath + 'item.config.json'));
  let readObj = SqlTool.getItemMsg(req.query.id);

  // 筛选封面
  readObj.cover = readObj.custom_cover ? readObj.custom_cover : readObj.cover;
  delete readObj.custom_cover;
  // 移除配置文件
  let spliceIndex = readConfigObj.files.indexOf('item.config.json');
  if (spliceIndex > -1) readConfigObj.files.splice(spliceIndex, 1);
  // readObj.files = readConfigObj.files.map(i => basePath + i)
  readObj.files = readConfigObj.files;
  readObj.url = basePath;

  res.send({ code: 200, data: readObj })
})

module.exports.dataRouter = dataRouter;
