const fs = require('fs')

/**
 * 扫描某个特定文件夹，生成配置信息xxxx.log.json并返回子文件夹名称的数组
 * @param {String} parentPath 父目录的路径
 * @param {String} folderName 需要扫描的文件夹名称
 * @param {String} type 需要扫描的文件夹的定制类型，指定sources、category
 * @returns Array 子文件夹的数组
 */
module.exports = scanFolder = (parentPath, folderName, type) => {
  // 获取完整路径
  let completePath = parentPath + folderName + '/';
  // 扫描当前目录
  let scanArr = fs.readdirSync(completePath);

  // 过滤该目录（获取其文件夹）
  scanArr = scanArr.filter(item => {
    return fs.lstatSync(completePath + item).isDirectory();
  })

  return scanArr;
}
