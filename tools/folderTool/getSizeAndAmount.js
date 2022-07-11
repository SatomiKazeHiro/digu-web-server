const fs = require("fs");

//遍历读取文件
function readFile(path, filesList) {
  let files = fs.readdirSync(path);
  files.forEach((file) => {
    let states = fs.statSync(path + "/" + file);
    if (states.isDirectory()) readFile(path + "/" + file, filesList);
    else {
      let obj = new Object();
      // 文件大小，以字节为单位
      obj.size = states.size;
      filesList.push(obj);
    }
  });
}

/**
 * 遍历目录及其子目录，获取文件夹大小
 * @param {String} path 文件夹路径
 * @returns
 */
module.exports = function (path) {
  let totalSize = 0;
  let filesList = [];
  readFile(path, filesList);
  for (let i = 0; i < filesList.length; i++) totalSize += filesList[i].size;
  return { amount: filesList.length, size: totalSize };
};
