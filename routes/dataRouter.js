/**
 * dataRouter处理数据请求，例如本地视频、图片的地址
 */
// 内置模块引用
const express = require("express");
const fs = require("fs");

const process = require("process")


// 创建路由示例
const dataRouter = express.Router();

// 资源初始化
let { initArea, initCategory, initItem } = require("../tools/init");

// 路由中间件
let { dataMiddleware } = require('../middleware/router');


const Cache = require('../cache');
const cache = Cache._instance;

// 获取域下随机的内容
// 未来增加：去除特定分类内容
dataRouter.get('/get/areaRandom', dataMiddleware, (req, res) => {
  // console.log(cache);

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

  // 从内存获取域
  let areaObj = cache.map.IdToUrl[area];
  // 获取总数
  let total = Object.getOwnPropertyNames(areaObj).length;
  // 判断limit的有效性
  if (limit > total) limit = total;
  // console.log(total);

  // 获取区域对象的Key的集合
  let keyArr = Object.keys(areaObj)
  // 返回对象
  let resArr = [];
  while (true) {
    // 从最大数量中获取随机数
    let index = keyArr.length * Math.random() << 0;
    // 在封装对象之前先判断返回对象是否包含了该项，包含了则跳过
    if (resArr.map(i => i.id).includes(keyArr[index])) {
      continue;
    }
    // 封装对象
    let tempObj = { id: keyArr[index], title: "", cover: "", url: "" };
    // 读取项目的配置文件
    let readObj = JSON.parse(fs.readFileSync(areaObj[keyArr[index]] + "item.config.json"));
    // 当自定义封面存在的时候使用自定义封面，否则使用默认封面（第一张图片）
    if (readObj.customCover) tempObj.cover = areaObj[keyArr[index]] + readObj.customCover;
    else tempObj.cover = areaObj[keyArr[index]] + readObj.cover;
    // Web上的url和title
    tempObj.url = readObj.url;
    tempObj.title = readObj.title;
    // 装载对象
    resArr.push(tempObj);
    // 当返回对象满足限制的时候返回结果
    if (resArr.length == limit) break;
  }
  res.send({ code: 200, data: resArr })

})

// 获取域的所有内容
// 未来增加：去除特定分类内容
dataRouter.get('/get/areaNormal', dataMiddleware, (req, res) => {
  // console.log(cache);

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

  // 从内存获取域
  let areaObj = cache.map.IdToUrl[area];
  // 获取项目总数
  let total = Object.getOwnPropertyNames(areaObj).length;
  // console.log(total);

  // 通过total总数和limit限制计算pageTotal
  let pageTotal = Math.ceil(total / limit);
  // 检测page合理性
  if (page > pageTotal) page = pageTotal;
  // 判断limit的有效性
  if (limit > total) limit = total;

  // 获取区域对象的Key的集合
  let keyArr = Object.keys(areaObj)

  // 数据集合
  let data = [];
  // 分页开始、结束位置
  let pageStart = limit * (page - 1);
  let pageEnd = total - limit * (page - 1) <= limit ? total : limit * page;
  // 封面
  let cover;
  for (let i = pageStart; i < pageEnd; i++) {
    // 读取每个项的配置文件
    let readObj = JSON.parse(fs.readFileSync(areaObj[keyArr[i]] + 'item.config.json'));
    // 设置封面
    cover = areaObj[keyArr[i]] + (readObj.customCover ? readObj.customCover : readObj.cover);
    // 装载
    data.push({
      id: readObj.id,
      title: readObj.title,
      cover,
      url: readObj.url
    });
  }

  res.send({ code: 200, data: { total, page, data } })
})

// 获取指定域下分类的随机内容
dataRouter.get('/get/categoryRandom', dataMiddleware, (req, res) => {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryRandom => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, category, limit } = req.query;

  // 读取category内容的数组，从中确认是否有该category
  let categoryArr = JSON.parse(fs.readFileSync(`./sources/${area}/area.config.json`)).dir;
  if (!categoryArr.includes(category)) res.send({ code: 400, msg: "category错误" });

  // 字符串数据处理
  limit = parseInt(limit);
  // 检测limit的合理性
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1)
    res.send({ code: 400, msg: "limit错误" });

  // 获取该category下的内容
  let itemArr = JSON.parse(fs.readFileSync(`./sources/${area}/${category}/category.config.json`)).dir;
  // 检查limit的范围
  if (limit > itemArr.length) limit = itemArr.length;

  // 返回数组
  let resArr = [];
  // 设置基础文件路径
  let basePath = `./sources/${area}/${category}/`;
  while (true) {
    // 从最大数量中获取随机数
    let index = itemArr.length * Math.random() << 0;
    // 判断封装数组是否重复
    if (resArr.map(i => i.title).includes(itemArr[index])) {
      continue;
    }

    // 读取项配置文件
    let readObj = JSON.parse(fs.readFileSync(basePath + itemArr[index] + '/item.config.json'));
    // 设置封面
    let cover = basePath + itemArr[index] + '/' + (readObj.customCover ? readObj.customCover : readObj.cover);
    // 封装对象
    let itemObj = {
      id: readObj.id,
      title: readObj.title,
      cover,
      url: readObj.url
    }
    // 装载
    resArr.push(itemObj)
    if (resArr.length == limit) break;
  }

  res.send({ code: 200, data: resArr })
})

// 获取指定域下分类的所有内容
dataRouter.get('/get/categoryNormal', dataMiddleware, (req, res) => {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryNormal => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, category, limit, page } = req.query;
  // console.log(area, category, limit, page);

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
  let categoryArr = JSON.parse(fs.readFileSync(`./sources/${area}/area.config.json`)).dir;
  if (!categoryArr.includes(category)) res.send({ code: 400, msg: "category错误" });

  // 获取该category下的内容
  let itemArr = JSON.parse(fs.readFileSync(`./sources/${area}/${category}/category.config.json`)).dir;
  let total = itemArr.length;

  // 通过total总数和limit限制计算pageTotal
  let pageTotal = Math.ceil(total / limit);
  // 检测page合理性
  if (page > pageTotal) page = pageTotal;
  // 判断limit的有效性
  if (limit > total) limit = total;


  // 数据集合
  let data = [];
  // 分页开始、结束位置
  let pageStart = limit * (page - 1);
  let pageEnd = total - limit * (page - 1) <= limit ? total : limit * page;
  // console.log(pageStart, pageEnd);
  // 设置基础文件路径
  let basePath = `./sources/${area}/${category}/`;
  // 封面
  let cover;
  for (let i = pageStart; i < pageEnd; i++) {
    // 读取每个项的配置文件
    let readObj = JSON.parse(fs.readFileSync(basePath + itemArr[i] + '/item.config.json'));
    // 设置封面
    cover = basePath + itemArr[i] + '/' + (readObj.customCover ? readObj.customCover : readObj.cover);
    // 装载
    data.push({
      id: readObj.id,
      title: readObj.title,
      cover,
      url: readObj.url
    });
  }

  res.send({ code: 200, data })

})

// 获取项目内容
dataRouter.get('/get/item', dataMiddleware, (req, res) => {
  // console.log(req.query);

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/item => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 通过area由内存校验id
  if (!cache.map.IdToUrl[req.query.area].hasOwnProperty(req.query.id)) {
    res.send({ code: 400, msg: "id错误" })
    return;
  }

  // 该id的基本路径
  let basePath = cache.map.IdToUrl[req.query.area][req.query.id];
  // 读取配置信息
  let readObj = JSON.parse(fs.readFileSync(basePath + 'item.config.json'));
  // console.log(readObj);

  // 返回对象的封装需要进一步处理的属性
  readObj.cover = basePath + readObj.cover;
  readObj.customCover = readObj.customCover ? (basePath + readObj.customCover) : "";
  let spliceIndex = readObj.files.indexOf('item.config.json');
  if (spliceIndex > -1) {
    readObj.files.splice(spliceIndex, 1);
  }
  readObj.files = readObj.files.map(i => basePath + i)

  res.send({ code: 200, data: readObj })
})

module.exports.dataRouter = dataRouter;
