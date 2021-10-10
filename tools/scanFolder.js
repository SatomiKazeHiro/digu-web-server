/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require('fs')
let ioLog = require('./ioLog');
let initLogPath = require('../config').initLogPath;
// const sortLikeWin = require('./sortLikeWin');

// 项目初始记录路径
// let initLogPath = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';

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

  // 过滤该目录、获取其文件夹
  scanArr = scanArr.filter(item => {
    return fs.lstatSync(completePath + item).isDirectory();
  })

  // 子系统条目中有子文件夹
  if (scanArr.length > 0) {
    return scanArr;


    // // log文件存在
    // if (fs.existsSync(completePath + type + '.config.json')) {

    //   // 根据已有的log文件对比删减情况
    //   let readObj = JSON.parse(fs.readFileSync(completePath + type + '.config.json'));
    //   let originArr = readObj.dir;

    //   // 复制配置文件内容
    //   let tempObj = {};
    //   // 类型是category的需要多一些操作
    //   if (type === "category") {
    //     if (readObj["item_template"]) tempObj.item_template = readObj.item_template;
    //     else tempObj.item_template = "";
    //     if (readObj["state"]) tempObj.state = readObj.state;
    //     else tempObj.state = "";
    //   }
    //   // 都用的则放在后边执行
    //   if (readObj["web_name"]) tempObj.web_name = readObj.web_name;
    //   else tempObj.web_name = "";
    //   if (readObj["log_template"]) tempObj.log_template = readObj.log_template;
    //   else tempObj.log_template = "";

    //   // 输出被移除的子文件夹
    //   originArr.forEach(item => {
    //     if (!scanArr.includes(item)) ioLog(initLogPath, '[-] ' + completePath.slice(1, -1) + ' -> ' + item, 'decrease');
    //   })

    //   // 新增的子文件夹
    //   scanArr.forEach(item => {
    //     if (!originArr.includes(item)) ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> ' + item, 'increase');
    //   })

    //   tempObj.dir = scanArr;

    //   // 更新log记录
    //   fs.writeFileSync(completePath + type + '.config.json', JSON.stringify(tempObj));

    // } else {
    //   // 没有的log（*.config.json）文件的则新建log并输出所有新增的子文件
    //   scanArr.forEach(item => {
    //     ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> ' + item, 'increase');
    //   })
    //   // 更新log记录
    //   // 判断类型，根据类型补充配置内容
    //   if (type === "category")
    //     fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: scanArr, web_name: "", log_template: "", item_template: "", state: "" }));
    //   else
    //     fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: scanArr, web_name: "", log_template: "" }));
    // }
  } else {
    // // 没有子文件夹，输出移除提示
    // if (fs.existsSync(completePath + type + '.config.json')) {

    //   // 根据已有的log文件对比删减情况
    //   let originArr = JSON.parse(fs.readFileSync(completePath + type + '.config.json')).dir;

    //   // 输出被移除的子文件夹
    //   originArr.forEach(item => {
    //     ioLog(initLogPath, '[-] ' + completePath.slice(1, -1) + ' -> ' + item, 'decrease');
    //   })
    // }
    // // 不管有没有log文件（*.config.json），都会清空log内容重写文件
    // // 判断类型，根据类型补充配置内容
    // if (type === "category")
    //   fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: [], web_name: "", log_template: "", item_template: "", state: "" }));
    // else
    //   fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: [], web_name: "", log_template: "" }));
    // // fs.writeFileSync(completePath + type + '.config.json', JSON.stringify({ dir: [], }));
  }

  return scanArr;
}
