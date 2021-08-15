const fs = require('fs');

/**
 * 资源area目录初始化，不深入遍历
 * @param {String} area area名称
 */
let initArea = (area) => {
  // 扫描area文件夹
  let scanArr = fs.readdirSync(`./sources/${area}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/area.config.json`, JSON.stringify({ dir: scanArr, }));
}

module.exports.initArea = initArea;
