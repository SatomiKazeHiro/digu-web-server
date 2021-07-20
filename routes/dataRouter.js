/**
 * dataRouter处理数据请求，例如本地视频、图片的地址
 */
// 内置模块引用
const express = require("express");
const fs = require("fs");

// 创建路由示例
const dataRouter = express.Router();

// 资源初始化
const { init_area, init_category, init_item } = require("../tools/init");

// 路由中间件
const { dataMiddleware } = require('../middleware/router');


dataRouter.get('/:area', dataMiddleware, (req, res) => {
  let area = req.params.area;
  // 存储数组
  let resArr = [];
  // 判断文件夹是否存在
  if (fs.existsSync(`./sources/${area}`)) {
    // 如果area.log配置文件不存在，初始化area
    if (!fs.existsSync(`./sources/${area}/area.log.json`)) init_area(area);
    let categoryArr = JSON.parse(fs.readFileSync(`./sources/${area}/area.log.json`)).dir;
    // category有文件夹
    if (categoryArr.length > 0) {
      // 遍历category数组
      categoryArr.forEach(category => {
        // 如果category.log配置文件不存在，初始化category
        if (!fs.existsSync(`./sources/${area}/${category}/category.log.json`)) init_category(area, category);
        let itemArr = JSON.parse(fs.readFileSync(`./sources/${area}/${category}/category.log.json`)).dir;
        // item有文件夹
        if (itemArr.length > 0) {
          itemArr.forEach(item => {
            // 如果item.log配置文件不存在，初始化item
            if (!fs.existsSync(`./sources/${area}/${category}/${item}/item.log.json`)) init_item(area, category, item);
            // 获取配置信息
            let itemObj = JSON.parse(fs.readFileSync(`./sources/${area}/${category}/${item}/item.log.json`));
            // 生成新的配置信息并返回
            idUrl = `/sources/${area}/${category}/${itemObj.id}`;
            coverUrl = itemObj.cover ? `/sources/${area}/${category}/${item}/${itemObj.cover}` : '';
            sourcePath = `/sources/${area}/${category}/${item}`;
            let resObj = {
              idUrl,
              coverUrl,
              sourcePath,
            }
            resArr.push(resObj);
          });
        }
      });
      if (resArr.length > 0) res.send({ code: 1, data: resArr });
      else res.send({ code: 0 });
    } else res.send({ code: 0 });
  } else res.send({ code: 0 });
})

dataRouter.get('/:area/:category', dataMiddleware, (req, res) => {
  res.send(req.params);
})

dataRouter.get('/:area/:category/media/:itemId', dataMiddleware, (req, res) => {
  res.send(req.params);
})

dataRouter.get('/:area/:category/play/:itemId', dataMiddleware, (req, res) => {
  res.send(req.params);
})

module.exports = dataRouter;
