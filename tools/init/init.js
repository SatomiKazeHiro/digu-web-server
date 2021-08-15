/**
 * 初始化项目,并生成配置文件
 */
const fs = require('fs');

let { excludeScanItemDir, initLogPath } = require("../../config");
let { ioLog } = require('../ioLog');
let { scanFolder, scanItem } = require('../scan')


/**
 * 资源目录初始化，深入遍历
 */
let init = () => {
  // 检测日记目录
  if (!fs.existsSync("./logs")) {
    // 资源目录不存在
    fs.mkdirSync("./logs");
    ioLog(initLogPath, '[+] / -> logs', 'decrease')
  }

  // 检测缓存映射目录
  if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
  let mapObj = {
    IdtoUrl: {},
    TagToIds: {}
  }

  // 检测资源目录
  if (!fs.existsSync("./sources")) {
    // sources文件夹不存在
    fs.mkdirSync("./sources");
    ioLog(initLogPath, '[+] / -> sources', 'decrease');

    // 创建默认子文件夹：动画，漫画，电影，视频，插画，相册，电子书
    let sourcesArray = ['anime', 'manga', 'movie', 'video', 'illustration', 'album', 'ebook'];
    sourcesArray.forEach(key => {
      fs.mkdirSync('./sources/' + key, { recursive: true });
      ioLog(initLogPath, '[+] /sources -> ' + key, 'decrease');
    });

    // 创建初始sources.log.json配置文件
    fs.appendFileSync('./sources/sources.config.json', JSON.stringify({ dir: sourcesArray, }), 'utf8');

  } else {
    // sources文件夹存在
    // 检测source子文件夹的内容
    let areaArr = scanFolder('./', 'sources', 'sources');
    // 当sources有内容时扫描
    if (areaArr.length > 0) {
      areaArr.forEach(area => {
        // 扫描area的子文件夹生成配置信息并返回category结果
        let categoryArr = scanFolder('./sources/', area, 'area');
        // 当category有内容时扫描
        if (categoryArr.length > 0) {
          // 检测category
          categoryArr.forEach(category => {
            // 扫描category的子文件夹生成配置信息并返回item结果
            let itemArr = scanFolder(`./sources/${area}/`, category, 'category');
            // 当category有内容时扫描
            if (itemArr.length > 0) {
              // 检测item
              itemArr.forEach(item => {
                // 跳过item部分的扫描,通常是游戏
                if (!excludeScanItemDir.includes(area)) {
                  let resObj = scanItem(`./sources/${area}/${category}/`, item);
                  mapObj.IdtoUrl[resObj.id] = resObj.url;
                }
              })
            }
          })
        }
      })
    }
  }

  fs.writeFileSync('./cache/map.json', JSON.stringify(mapObj), 'utf8');
}

module.exports.init = init;
