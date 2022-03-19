/**
 * 主站页面的路由
 */
const process = require("process");
const fs = require("fs");

const express = require("express");
const indexRouter = express.Router();

// 路由中间件
const { dataMiddleware } = require('../../middleware');

// 数据库工具

const SqlTool = process.__class.SqlTool;

// 转换带有单位的大小
let sizeFormat = function (size) {
  if (size < 1024) return size + "B";
  else if (size / 1024 < 1024) return (size / 1024).toFixed(2) + "KB";
  else if (size / 1024 / 1024 < 1024)
    return (size / 1024 / 2014).toFixed(2) + "MB";
  else if (size / 1024 / 1024 / 1024 < 1024)
    return (size / 1024 / 2014 / 1024).toFixed(2) + "GB";
}

// 获取所有的域的名字
indexRouter.get('/areaAllName', (req, res) => {
  let resArr = SqlTool.getAreas(req.query.isOnlyArea === "true");
  res.send({ code: 200, data: resArr });
})

// 获取指定域下的所有类的名字
indexRouter.get('/categoryAllName', (req, res) => {

  let { area } = req.query;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

  let resArr = SqlTool.getCategories(area, false);
  res.send({ code: 200, data: resArr });

})

// 获取随机资源项目内容（用于首页比较多）
indexRouter.get('/itemRandom', (req, res) => {

  let { limit } = req.query;

  // 处理每页限制
  limit = parseInt(limit);
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
indexRouter.get('/areaRandom', (req, res) => {
  // 获取请求参数
  let { area, limit } = req.query;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

  // 字符串数据处理
  limit = parseInt(limit)
  if (typeof (limit) == "undefined" || isNaN(limit) || limit < 1) {
    res.send({ code: 400, msg: "limit错误" });
    return;
  }

  // 从内存获取域下所有资源目录的集合
  let itemIds = SqlTool.getItemId(area);
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
  res.send({ code: 200, data: resArr });
})

// 获取指定域的所有内容
indexRouter.get('/areaNormal', (req, res) => {
  // 获取请求参数
  let { area, limit, page, msgType } = req.query;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

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
  let iIdArr = SqlTool.getItemId(area);

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
        amount: readObj.amount,
        size: sizeFormat(readObj.size)
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
indexRouter.get('/categoryRandom', (req, res) => {
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
  let itemIds = SqlTool.getItemId(area, category);
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

  res.send({ code: 200, data: resArr });
})

// 获取指定域下分类中的所有内容
indexRouter.get('/categoryNormal', (req, res) => {
  // 获取请求参数
  let { area, category, limit, page, msgType } = req.query;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

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

  // 读取 category 内容的数组，从中确认是否有该 category
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 获取该category下的资源目录内容
  let iIdArr = SqlTool.getItemId(area, category);

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
        amount: readObj.amount,
        size: sizeFormat(readObj.size)
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
indexRouter.get('/item', (req, res) => {
  let { area, category, id } = req.query;

  // 检测资源目录id是否存在
  if (!SqlTool.findItem(id)) {
    res.send({ code: 400, msg: "id错误" });
    return;
  }

  // 检测域、分类是否正确
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 查看设置的展示模板
  let template = SqlTool.getItemShowTempalte(area, category);
  if (!template) {
    // 如果模板不存在则反馈给前端
    res.send({ code: 400, data: { type: "no-Template", msg: "未设置模板" } })
    return;
  }

  let readObj = SqlTool.getItemMsg(id);
  readObj.template = template;
  // 筛选封面
  readObj.cover = readObj.custom_cover ? readObj.custom_cover : readObj.cover;
  delete readObj.custom_cover;

  if (readObj.sources_url) {
    // 读取配置信息
    let readConfigObj = JSON.parse(fs.readFileSync('.' + readObj.sources_url + 'item.config.json'));
    // 移除配置文件，避免出现在返回的信息中
    let spliceIndex = readConfigObj.files.indexOf('item.config.json');
    if (spliceIndex > -1) readConfigObj.files.splice(spliceIndex, 1);
    readObj.files = readConfigObj.files;
  }

  res.send({ code: 200, data: readObj });
})

module.exports = indexRouter;
