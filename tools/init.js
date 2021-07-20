/**
 * 初始化项目,并生成配置文件
 */
const fs = require('fs');
const { ioLog } = require('./ioLog');
const { scanFolder, scanItem } = require('./scanFile')
const { excludeScanItemDir, initLogPath } = require("../config");

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
    fs.appendFileSync('./sources/sources.log.json', JSON.stringify({ dir: sourcesArray, }), 'utf8');

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
                  scanItem(`./sources/${area}/${category}/`, item)
                }
              })
            }
          })
        }
      })
    }
  }
}

/**
 * 资源sourcs目录初始化，不深入遍历
 */
let init_sources = () => {
  // 扫描sources文件夹
  let scanArr = fs.readdirSync(`./sources`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/sources.log.json`, JSON.stringify({ dir: scanArr, }));
}

/**
 * 资源area目录初始化，不深入遍历
 * @param {String} area area名称
 */
let init_area = (area) => {
  // 扫描area文件夹
  let scanArr = fs.readdirSync(`./sources/${area}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/area.log.json`, JSON.stringify({ dir: scanArr, }));
}

/**
 * 资源category目录初始化，不深入遍历
 * @param {String} area area名称
 * @param {String} category category名称
 */
let init_category = (area, category) => {
  // 扫描category文件夹
  let scanArr = fs.readdirSync(`./sources/${area}/${category}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${category}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/${category}/category.log.json`, JSON.stringify({ dir: scanArr, }));
}

/**
 * 资源item目录初始化，不深入遍历
 * @param {String} area area名称
 * @param {String} category category名称
 * @param {String} item item名称
 */
let init_item = (area, category, item) => {
  // 扫描item文件夹
  let scanArr = fs.readdirSync(`./sources/${area}/${category}/${item}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${category}/${item}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/${category}/${item}/item.log.json`, JSON.stringify({ dir: scanArr, }));
}

module.exports.init = init;
module.exports.init_sources = init_sources;
module.exports.init_area = init_area;
module.exports.init_category = init_category;
module.exports.init_item = init_item;
