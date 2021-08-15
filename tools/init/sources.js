const fs = require('fs');

/**
 * 资源sourcs目录初始化，不深入遍历
 */
 let initSources = () => {
  // 扫描sources文件夹
  let scanArr = fs.readdirSync(`./sources`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/sources.config.json`, JSON.stringify({ dir: scanArr, }));
}

module.exports.initSources = initSources;
