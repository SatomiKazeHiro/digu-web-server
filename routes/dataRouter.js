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
let { dataMiddleware } = require('../middleware');

let SqlTool = require('../tools/SqlTool');

// 获取所有的域的名字
dataRouter.get('/get/areaAllName', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/areaAllName => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  let resArr = SqlTool.getAreas()
  res.send({ code: 200, data: resArr })
})

// 获取指定域下的所有类的名字
dataRouter.get('/get/getCategories', (req, res) => {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/getCategories => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  if (req.query.area) {
    let resArr = SqlTool.getCategories(req.query.area, false);
    res.send({ code: 200, data: resArr });
  } else res.send({ code: 400, msg: "area错误" });

})

// 获取随机资源项目内容（用于首页比较多）
dataRouter.get('/get/itemRandom', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/itemRandom => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let limit = req.query.limit;
  // 字符串数据处理
  limit = parseInt(limit)
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" });
    return;
  }

  let itemIds = SqlTool.getItemId();
  if (limit > itemIds.length) limit = itemIds.length;

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

// 获取指定域的随机内容
dataRouter.get('/get/areaRandom', (req, res) => {

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
  let itemIds = SqlTool.getItemIdByArea(area);
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
    // 判断是否右要排除在外的资源项目（场景：避免某资源项目下的随机项目和本身相同）
    if (req.query.excludeID && itemIds[index] == req.query.excludeID) {
      continue;
    }
    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    let url = SqlTool.getItemUrl(itemObj.id);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      url,
    });
    if (resArr.length == limit) break;
  }
  res.send({ code: 200, data: resArr })
})

// 获取指定域的所有内容
dataRouter.get('/get/areaNormal', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/areaNormal => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, limit, page, msgType } = req.query;
  // console.log(area, limit, page);

  // 字符串数据处理
  limit = parseInt(limit);
  page = parseInt(page);
  // 检测 limit 和 page 的合理性
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" });
    return;
  }
  if (typeof (page) == "undefined" || isNaN(page) || page < 1) {
    res.send({ code: 400, msg: "page错误" });
    return;
  }

  // 获取指定域下所有资源目录id的内容
  let iIdArr = SqlTool.getItemIdByArea(area);

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

  let readObj, link_url, sources_url;
  for (let i = pageStart; i < pageEnd; i++) {
    readObj = SqlTool.getItemMsg(iIdArr[i]);
    link_url = `/${readObj.area}/${readObj.category}/${readObj.id}`;
    sources_url = `/sources/${readObj.area}/${readObj.category}/${readObj.item}`;
    if (msgType === "all")
      resArr.push({
        id: readObj.id,
        cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
        title: readObj.title,
        link_url,
        sources_url,
        intro: readObj.intro,
        type: readObj.type,
      });
    else
      resArr.push({
        id: readObj.id,
        cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
        title: readObj.title,
        link_url,
        sources_url,
      });
    readObj = null;
    link_url = "";
    sources_url = "";
  }

  res.send({ code: 200, data: { resArr, page, total } })
})

// 获取指定域下分类中的随机内容
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
  let itemIds = SqlTool.getItemIdByAC(area, category);
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

// 获取指定域下分类中的所有内容
dataRouter.get('/get/categoryNormal', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryNormal => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  // 获取请求参数
  let { area, category, limit, page, msgType } = req.query;

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

  // 读取 category 内容的数组，从中确认是否有该 category
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 获取该category下的资源目录内容
  let iIdArr = SqlTool.getItemIdByAC(area, category);

  // 通过所有资源目录id的total总数和limit限制计算总页数pageTotal
  let total = iIdArr.length;
  let pageTotal = Math.ceil(total / limit);
  // 检测page合理性
  if (page > pageTotal) page = pageTotal;
  // 判断limit的有效性
  if (limit > total) limit = total;

  // 数据集合
  let resArr = [];
  // 分页开始、结束位置
  let pageStart = limit * (page - 1);
  let pageEnd = total - limit * (page - 1) <= limit ? total : limit * page;

  let readObj, link_url, sources_url;
  for (let i = pageStart; i < pageEnd; i++) {
    readObj = SqlTool.getItemMsg(iIdArr[i]);
    link_url = `/${readObj.area}/${readObj.category}/${readObj.id}`;
    sources_url = `/sources/${readObj.area}/${readObj.category}/${readObj.item}`;
    if (msgType === "all")
      resArr.push({
        id: readObj.id,
        cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
        title: readObj.title,
        link_url,
        sources_url,
        intro: readObj.intro,
        type: readObj.type,
      });
    else
      resArr.push({
        id: readObj.id,
        cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
        title: readObj.title,
        link_url,
        sources_url,
      });
    readObj = null;
    link_url = "";
    sources_url = "";
  }

  res.send({ code: 200, data: { resArr, page, total } })

})

// 获取指定 id 资源项目内容
dataRouter.get('/get/item', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/item => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  let { area, category, id } = req.query;

  // 校验资源目录id是否存在
  if (!SqlTool.findItem(id)) {
    res.send({ code: 400, msg: "id错误" })
    return;
  }

  // 查看设置的展示模板
  let template = SqlTool.getItemShowTempalte(area, category);
  if (!template) {
    // 如果模板不存在则反馈给前端
    res.send({ code: 403, data: { type: "no-Template", msg: "未设置模板" } })
    return;
  }

  // 该资源目录id的基本路径
  let basePath = SqlTool.getItemUrl(id, true);
  // 读取配置信息
  let readConfigObj = JSON.parse(fs.readFileSync('.' + basePath + 'item.config.json'));
  let readObj = SqlTool.getItemMsg(id);

  // 移除配置文件，避免出现在返回的信息中
  let spliceIndex = readConfigObj.files.indexOf('item.config.json');
  if (spliceIndex > -1) readConfigObj.files.splice(spliceIndex, 1);
  // 筛选封面
  readObj.cover = readObj.custom_cover ? readObj.custom_cover : readObj.cover;
  delete readObj.custom_cover;
  readObj.files = readConfigObj.files;
  readObj.url = basePath;
  readObj.template = template;

  res.send({ code: 200, data: readObj })
})

// 检测是否有指定域
dataRouter.get('/check/area', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/check/area => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  let resBoolean = SqlTool.findArea(req.query.area);
  res.send({ code: 200, data: resBoolean });
})

// 检测是否有指定类
dataRouter.get('/check/category', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/check/category => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  let resBoolean = SqlTool.findCategory(req.query.area, req.query.category);
  res.send({ code: 200, data: resBoolean });
})

// 检测是否有指定资源项目
dataRouter.get('/check/item', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/check/item => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  let resBoolean = SqlTool.findItem(req.query.id)
  res.send({ code: 200, data: resBoolean });
})

// 生成目录树
dataRouter.get('/get/logtree', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/logtree => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

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
dataRouter.get('/get/aeraIndex', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/aeraIndex => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  if (req.query.area) {
    let resObj = SqlTool.getAreaMsg(req.query.area);
    res.send({ code: 200, data: resObj })
  } else res.send({ code: 400, msg: "area为空" })
})

// 获取 category 的配置信息
dataRouter.get('/get/categoryIndex', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/get/categoryIndex => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  if (!req.query.area) res.send({ code: 400, msg: "area为空" });
  else if (!req.query.category) res.send({ code: 400, msg: "category为空" });
  else {
    let resObj = SqlTool.getCategoryMsg(req.query.area, req.query.category);
    res.send({ code: 200, data: resObj });
  }
})

// 设置 area
dataRouter.get('/set/areaIndex', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/set/areaIndex => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  if (req.query.areaObj) {
    if (SqlTool.update('areas_index', JSON.parse(req.query.areaObj))) {
      res.send({ code: 200 });
    }
    else res.send({ code: 400, msg: "数据库操作出现错误" })
  } else res.send({ code: 400, msg: "参数错误" })
})

// 设置 category
dataRouter.get('/set/categoryIndex', (req, res) => {

  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  console.log('/set/categoryIndex => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

  if (req.query.categoryObj) {
    if (SqlTool.update('categories_index', JSON.parse(req.query.categoryObj))) {
      res.send({ code: 200 });
    }
    else res.send({ code: 400, msg: "数据库操作出现错误" })
  } else res.send({ code: 400, msg: "参数错误" })
})

module.exports.dataRouter = dataRouter;
