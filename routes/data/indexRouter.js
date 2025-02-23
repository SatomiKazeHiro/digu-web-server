/**
 * 主站页面的路由
 */
const process = require("process");
const fs = require("fs");
const path = require("path");

const express = require("express");
const indexRouter = express.Router();

// 路由中间件
const { dataMiddleware } = require("../../middleware");

// 资源数据库工具
const SqlTool = process.__sql.SOURCES_SQL_TOOL;

// 转换带有单位的大小
let sizeFormat = function (size) {
  if (size < 1024) return size + "B";
  else if (size / 1024 < 1024) return (size / 1024).toFixed(2) + "KB";
  else if (size / 1024 / 1024 < 1024) return (size / 1024 / 1024).toFixed(2) + "MB";
  else if (size / 1024 / 1024 / 1024 < 1024) return (size / 1024 / 1024 / 1024).toFixed(2) + "GB";
};

// 获取所有的域的名字
indexRouter.get("/areaAllName", (req, res) => {
  let resArr = SqlTool.getAreas(req.query.isOnlyArea === "true");
  res.send({ code: 200, data: resArr });
});

// // 获取指定域下的所有类的名字
// indexRouter.get("/categoryAllName", (req, res) => {
//   let { area } = req.query;

//   if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

//   let resArr = SqlTool.getCategories(area, false);
//   res.send({ code: 200, data: resArr });
// });

// 获取随机资源项目内容（用于首页比较多）
indexRouter.get("/itemRandom", (req, res) => {
  let { limit } = req.query;

  // 处理每页限制
  limit = parseInt(limit);
  if (typeof limit == "undefined" || isNaN(limit) || limit < 1) {
    return res.send({ code: 400, msg: "limit错误" });
  }
  let itemIds = SqlTool.getItemId();
  if (limit > itemIds.length) limit = itemIds.length;

  // 返回对象
  let resArr = [];
  while (true) {
    // 从最大数量中获取随机数
    let index = (itemIds.length * Math.random()) << 0;
    // 在封装对象之前先判断返回对象是否包含了该项，包含了则跳过
    if (resArr.map((i) => i.id).includes(itemIds[index])) {
      continue;
    }
    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      source_url: itemObj.sources_url,
      link_url: itemObj.link_url,
      intro: itemObj.intro,
      area_web_name: itemObj.area_web_name,
      category_web_name: itemObj.category_web_name,
    });

    if (resArr.length == limit) break;
  }
  res.send({ code: 200, data: resArr });
});

/**
 * 获取指定域的随机内容
 * @param area域名
 * @param limit 条数
 * @param excludeId 过滤的资源id
 * @return 消息体
 */
indexRouter.post("/areaRandom", (req, res) => {
  // 获取请求参数
  let { area, limit, excludeId } = req.body;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

  // 字符串数据处理
  limit = parseInt(limit);
  if (typeof limit == "undefined" || isNaN(limit) || limit < 1) {
    return res.send({ code: 400, msg: "limit错误" });
  }

  // 从内存获取域下所有资源目录的集合
  let itemIds = SqlTool.getItemId(area);
  // 计算总数
  let total = itemIds.length;
  // 判断分页量的有效性
  if (limit > total) limit = total;

  // 返回对象
  let resArr = [];
  let resIds = excludeId ? [excludeId] : [];
  while (true) {
    // 从最大数量中获取随机数
    let index = (itemIds.length * Math.random()) << 0;
    // 判断是否右要排除在外的资源项目（场景：避免某资源项目下的随机项目和本身相同）
    if (req.query.excludeID && itemIds[index] == req.query.excludeID) {
      continue;
    }
    // 在封装对象之前先判断返回对象是否包含了该项，包含了则跳过
    if (resIds.includes(itemIds[index])) {
      continue;
    }
    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    resIds.push(itemObj.id);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      source_url: itemObj.sources_url,
      link_url: itemObj.link_url,
    });
    if (resArr.length == limit) break;
  }
  res.send({ code: 200, data: resArr });
});

/**
 * 获取指定域的所有内容
 * @param area 域名
 * @param limit 条数
 * @param page 页数
 * @param msgType 详情数量
 * @return 消息体
 */
indexRouter.post("/areaNormal", (req, res) => {
  // 获取请求参数
  let { area, limit, page, msgType } = req.body;

  if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });

  // 字符串数据处理
  limit = parseInt(limit);
  page = parseInt(page);
  // 检测 limit 和 page 的合理性
  if (typeof limit == "undefined" || isNaN(limit) || limit < 1) {
    return res.send({ code: 400, msg: "limit错误" });
  }
  if (typeof page == "undefined" || isNaN(page) || page < 1) {
    return res.send({ code: 400, msg: "page错误" });
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
    if (msgType === "rich")
      resArr.push({
        id: readObj.id,
        cover: readObj.custom_cover ? readObj.custom_cover : readObj.cover,
        title: readObj.title,
        link_url,
        sources_url,
        intro: readObj.intro,
        type: readObj.type,
        amount: readObj.amount,
        size: sizeFormat(readObj.size),
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

  res.send({ code: 200, data: { data: resArr, page, total } });
});

// 获取指定域下分类中的随机内容
indexRouter.get("/categoryRandom", (req, res) => {
  // 获取请求参数
  let { area, category, limit } = req.query;

  // 读取category内容的数组，从中确认是否有该category
  if (!SqlTool.findCategory(area, category)) res.send({ code: 400, msg: "category错误" });

  // 字符串数据处理
  limit = parseInt(limit);
  // 检测limit的合理性
  if (typeof limit == "undefined" || isNaN(limit) || limit < 1) {
    return res.send({ code: 400, msg: "limit错误" });
  }

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
    let index = (itemIds.length * Math.random()) << 0;
    // 判断封装数组是否重复
    if (resArr.map((i) => i.id).includes(itemIds[index])) {
      continue;
    }

    let itemObj = SqlTool.getItemMsg(itemIds[index]);
    resArr.push({
      id: itemObj.id,
      cover: itemObj.custom_cover ? itemObj.custom_cover : itemObj.cover,
      title: itemObj.title,
      url: basePath,
    });

    if (resArr.length == limit) break;
  }

  res.send({ code: 200, data: resArr });
});

/**
 * 获取指定域下分类中的所有内容
 * @param area 域名
 * @param category 类名
 * @param limit 条数
 * @param page 页数
 * @param msgType 详情数量
 * @return 消息体
 */
indexRouter.post("/categoryNormal", (req, res) => {
  // 获取请求参数
  let { area, category, limit, page, msgType } = req.body;

  if (!SqlTool.findArea(area)) {
    return res.send({ code: 400, msg: "area错误" });
  }

  // 字符串数据处理
  limit = parseInt(limit);
  page = parseInt(page);
  // 检测limit和page的合理性
  if (typeof limit == "undefined" || isNaN(limit) || limit < 1) {
    return res.send({ code: 400, msg: "limit错误" });
  }
  if (typeof page == "undefined" || isNaN(page) || page < 1) {
    return res.send({ code: 400, msg: "page错误" });
  }

  // 读取 category 内容的数组，从中确认是否有该 category
  if (!SqlTool.findCategory(area, category)) {
    return res.send({ code: 400, msg: "category错误" });
  }

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
        size: sizeFormat(readObj.size),
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

  res.send({ code: 200, data: { data: resArr, page, total } });
});

/**
 * 获取指定 id 资源项目内容
 * @param area 域名
 * @param category 类名
 * @param resourceId 资源id
 * @return 消息体
 */
indexRouter.post("/item", (req, res) => {
  let { area, category, resourceId: id } = req.body;

  // 检测资源目录id是否存在
  if (!SqlTool.findItem(id)) {
    return res.send({ code: 400, msg: "id错误" });
  }

  // 检测域、分类是否正确
  if (!SqlTool.findCategory(area, category)) {
    return res.send({ code: 400, msg: "category错误" });
  }

  // 查看设置的展示模板
  let template = SqlTool.getItemShowTempalte(area, category);
  if (!template) {
    // 如果模板不存在则反馈给前端
    return res.send({
      code: 400,
      msg: "未设置模板",
      data: { type: "no-Template" },
    });
  }

  let readObj = SqlTool.getItemMsg(id);
  readObj.template = template;
  // 筛选封面
  readObj.cover = readObj.custom_cover ? readObj.custom_cover : readObj.cover;
  delete readObj.custom_cover;

  if (readObj.sources_url) {
    let configPath = "." + readObj.sources_url + "item.config.json";
    if (fs.existsSync(configPath)) {
      // 读取配置信息
      let readConfigObj = JSON.parse(fs.readFileSync(configPath));
      // 移除配置文件，避免出现在返回的信息中
      // let spliceIndex = readConfigObj.files.indexOf("item.config.json");
      // if (spliceIndex > -1) readConfigObj.files.splice(spliceIndex, 1);
      let index = readConfigObj.files_detail.findIndex((f) => f.target === "item.config.json");
      if (index > -1) readConfigObj.files_detail.splice(index, 1);
      readObj.files_detail = readConfigObj.files_detail;
    } else {
      // 不存在则进行扫描操作
    }
  }

  res.send({ code: 200, data: readObj });
});

// 生成导航路径
indexRouter.get("/acPath", (req, res) => {
  let { area, category } = req.query;

  if (!SqlTool.findCategory(area, category)) {
    if (!SqlTool.findArea(area)) return res.send({ code: 400, msg: "area错误" });
    else return res.send({ code: 400, msg: "category错误" });
  }

  let areaObj = SqlTool.getAreaMsg(area);
  let categoryObj = SqlTool.getCategoryMsg(area, category);

  res.send({
    code: 200,
    data: {
      area: areaObj.area,
      area_web_name: areaObj.web_name,
      category: categoryObj.category,
      category_web_name: categoryObj.web_name,
    },
  });
});

// 生成导航路径
indexRouter.post("/getFolderFiles", (req, res) => {
  let folderPath = req.body.path;
  if (folderPath.indexOf("/") === 0) folderPath = "." + folderPath;

  if (fs.existsSync(folderPath)) {
    let data = { details: [] };
    let scanArr = fs.readdirSync(folderPath);
    scanArr.forEach((file) => {
      stat = fs.lstatSync(`${folderPath}/${file}`);
      data.details.push({
        target: file,
        name: stat.isDirectory() ? file : path.basename(file, path.extname(file)),
        type: stat.isDirectory() ? "directory" : "file",
        ext: stat.isDirectory() ? null : path.extname(file),
        path: `${folderPath.substr(1)}/${file}`,
      });
    });

    return res.send({
      code: 200,
      data,
    });
  } else {
    return res.send({ code: 400, msg: "路径错误" });
  }
});

module.exports = indexRouter;
