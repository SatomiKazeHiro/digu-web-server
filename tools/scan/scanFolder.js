/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require('fs')
let { ioLog } = require('../ioLog');
// const sortLikeWin = require('./sortLikeWin');

// 项目初始记录路径
let initLogPath = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';

/**
 * 扫描某个特定文件夹，生成配置信息xxxx.log.json并返回子文件夹名称的数组
 * @param {String} parentPath 父目录的路径
 * @param {String} folderName 需要扫描的文件夹名称
 * @param {String} type 需要扫描的文件夹的定制类型
 * @returns Array 子文件夹的数组
 */
let scanFolder = (parentPath, folderName, type) => {
  // 合并成完整路径
  let completePath = parentPath + folderName + '/';

  // 扫描文件夹
  let scanArr = fs.readdirSync(completePath);

  // 没有子系统条目
  if (scanArr.length == 0) fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: [], }));
  else {
    // 有子系统条目

    // 过滤非文件夹的文件
    scanArr = scanArr.filter(item => {
      return fs.lstatSync(completePath + item).isDirectory()
    })

    // 子系统条目中有子文件夹
    if (scanArr.length > 0) {

      // log文件存在
      if (fs.existsSync(completePath + type + '.config.json')) {

        // 根据已有的log文件对比删减情况
        let originArr = JSON.parse(fs.readFileSync(completePath + type + '.config.json')).dir;

        // 输出被移除的子文件夹
        originArr.forEach(item => {
          if (!scanArr.includes(item)) ioLog(initLogPath, '[-] ' + completePath.slice(1, -1) + ' -> ' + item, 'decrease');
        })

        // 新增的子文件夹
        scanArr.forEach(item => {
          if (!originArr.includes(item)) ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> ' + item, 'increase');
        })

        // 更新log记录
        fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: scanArr, }));

      } else {
        // 没有的log文件的则新建log并输出所有新增的子文件
        scanArr.forEach(item => {
          ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> ' + item, 'increase');
        })
        // 更新log记录
        fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: scanArr, }));
      }
    } else {
      // 没有子文件夹，输出移除提示
      if (fs.existsSync(completePath + type + '.config.json')) {

        // 根据已有的log文件对比删减情况
        let originArr = JSON.parse(fs.readFileSync(completePath + type + '.config.json')).dir;

        // 输出被移除的子文件夹
        originArr.forEach(item => {
          ioLog(initLogPath, '[-] ' + completePath.slice(1, -1) + ' -> ' + item, 'decrease');
        })
      }
      // 不管有没有log，都会清空内容重写log文件
      fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: [], }));
    }
  }
  return scanArr;
}

module.exports.scanFolder = scanFolder;
