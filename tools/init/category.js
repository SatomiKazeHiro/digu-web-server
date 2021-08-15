const fs = require('fs');

/**
 * 资源category目录初始化，不深入遍历
 * @param {String} area area名称
 * @param {String} category category名称
 */
let initCategory = (area, category) => {
  // 扫描category文件夹
  let scanArr = fs.readdirSync(`./sources/${area}/${category}`);
  // 过滤非文件夹文件
  scanArr = scanArr.filter(element => {
    return fs.lstatSync(`./sources/${area}/${category}/${element}`).isDirectory()
  })
  // 更新log信息
  fs.writeFileSync(`./sources/${area}/${category}/category.config.json`, JSON.stringify({ dir: scanArr, }));
}

module.exports.initCategory = initCategory;
