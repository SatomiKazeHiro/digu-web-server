const fs = require('fs');

/**
 * 资源item目录初始化，不深入遍历
 * @param {String} area area名称
 * @param {String} category category名称
 * @param {String} item item名称
 */
let initItem = (area, category, item) => {
  // 扫描item文件夹
  let scanArr = fs.readdirSync(`./sources/${area}/${category}/${item}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${category}/${item}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/${category}/${item}/item.config.json`, JSON.stringify({ dir: scanArr, }));
}

module.exports.initItem = initItem;
