/**
 * 初始化项目,并生成配置文件
 */
const fs = require('fs');

let { initLogPath, baseArea } = require("../config");
let scanFolder = require('./scanFolder');
let { scanItem } = require('./scanItem');
let ioLog = require('./ioLog');
let SqlTool = require('./SqlTool');

/**
 * 资源目录初始化，深入遍历
 */
module.exports = init = () => {
  // 数据库初始化条目字段init为0
  SqlTool.setInitFalse();

  // 检测日记目录
  if (!fs.existsSync("./logs")) {
    // 资源目录不存在则创建
    fs.mkdirSync("./logs");
    ioLog(initLogPath, '[+] / -> logs', 'increase');
  }

  // 检测资源目录
  if (!fs.existsSync("./sources")) {
    // sources文件夹不存在
    fs.mkdirSync("./sources");
    ioLog(initLogPath, '[+] / -> sources', 'increase');

    // 根据配置文件创建默认子文件夹
    baseArea.forEach((area) => {
      fs.mkdirSync('./sources/' + area, { recursive: true });
      if (SqlTool.findArea(area)) SqlTool.setInitTrue(area);
      else if (SqlTool.insert('areas_index', { area, web_name: area, log_template: "normal", state: "hide", init: 1 })) ioLog(initLogPath, '[+] /sources -> ' + area, 'increase');
    });

  } else {
    // sources文件夹存在
    // 检测source子文件夹的内容
    let areaArr = scanFolder('./', 'sources', 'sources');
    areaArr.forEach(area => {
      // 判断数据库是否有该域（area），有则设置init为1，没有则插入新数据
      if (SqlTool.findArea(area)) SqlTool.setInitTrue(area);
      else if (SqlTool.insert('areas_index', { area, web_name: area, log_template: "normal", state: "hide", init: 1 })) ioLog(initLogPath, '[+] /sources -> ' + area, 'increase');
      let categoryArr = scanFolder(`./sources/`, area, 'area');
      if (categoryArr.length > 0) {
        categoryArr.forEach(category => {
          // 判断数据库在某域的前提下是否有某一分类（category），有则设置init为1，没有则插入新数据
          if (SqlTool.findCategory(area, category)) SqlTool.setInitTrue(area, category);
          else if (SqlTool.insert('categories_index', { area, category, web_name: category, log_template: "normal", state: "hide", item_log_template: "", init: 1 })) ioLog(initLogPath, '[+] /sources -> ' + category, 'increase');
          let itemArr = scanFolder(`./sources/${area}/`, category, 'category');
          if (itemArr.length > 0) {
            itemArr.forEach(item => {
              let itemObj = scanItem(`./sources/${area}/${category}/`, item);

              // 判断数据库中是否有该资源（item），有则先设置其init为1，没有则插入新数据
              if (SqlTool.findItem(itemObj.id)) {
                SqlTool.setInitTrue(null, null, itemObj.id);
                // 更新数据
                if (itemObj.up) {
                  SqlTool.update('item_msg', { id: itemObj.id, cover: itemObj.cover, title: itemObj.title, intro: itemObj.intro, custom_cover: itemObj.custom_cover, type: itemObj.type })
                  ioLog(initLogPath, `[+] /sources/${area}/${category}/${item} -> UP`, 'up');
                }
              } else {
                // 插入数据到资源信息表和索引表
                if (SqlTool.insert('items_index', { id: itemObj.id, area, category, item: itemObj.title, init: 1 }) && SqlTool.insert('item_msg', { id: itemObj.id, cover: itemObj.cover, title: itemObj.title, intro: itemObj.intro, custom_cover: itemObj.custom_cover, type: itemObj.type })) {
                  // tag索引
                  // if (itemObj.tags.length > 0)
                  //   itemObj.tags.forEach(tag => {
                  //     SqlTool.insert('tags_index', { tag, id: itemObj.id })
                  //   })
                  // 输出更新信息
                  ioLog(initLogPath, `[+] /sources/${area}/${category} -> ${item}`, 'increase');
                  // 如果是搬迁过来的资源，其带有item.config.json的，在写入数据库之后也需要up输出
                  ioLog(initLogPath, `[+] /sources/${area}/${category}/${item} -> UP`, 'up');
                }
              }
            })
          }
        })
      }
    })
  }
  // 清除不存在的资源目录的数据库信息
  SqlTool.deleteInitFalseAC((msg, type) => {
    ioLog(initLogPath, msg, type);
  });
  SqlTool.deleteInitFalseI((msg, type) => {
    ioLog(initLogPath, msg, type);
  });
}
