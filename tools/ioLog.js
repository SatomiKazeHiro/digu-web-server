/**
 * 控制台输出,并写入日记文件
 */
const { EOL } = require("os");
const { appendFileSync } = require('fs');

// 自定义打印加追加文本方法
/**
 * 输出log并保存log信息
 * @param {String} path i/o log配置文件的路径
 * @param {String} msg 需要输出的信息
 * @param {String} type 输出信息类型
 */
let ioLog = (path, msg, type) => {
  // 生成时间
  let time = new Date();
  // 开头格式字符串
  let startStr = '     - ';
  // 保存内容模板[INFO]
  let logINFO = `[INFO][${time}] ${msg}${EOL}`;
  // 判断输出的消息的类型
  if (!type) {
    // 没有指定类型则输出一般信息
    console.log(startStr + msg);
    appendFileSync(path, logINFO, 'utf8');
  } else if (type.toLowerCase() == 'increase') {
    // 输出系统目录增加的信息
    console.log(startStr + '\033[40;36m' + msg + '\033[0m');
    appendFileSync(path, logINFO, 'utf8');
  } else if (type.toLowerCase() == 'decrease') {
    // 输出系统目录被移除的信息
    console.log(startStr + '\033[40;31m' + msg + '\033[0m');
    appendFileSync(path, logINFO, 'utf8');
  } else if (type.toLowerCase() == 'up') {
    // 输出目录内容成功装载的信息
    console.log(startStr + '\033[40;32m' + msg + '\033[0m');
    appendFileSync(path, logINFO, 'utf8');
  } else if (type.toLowerCase() == 'warning') {
    // 输出目录内容成功装载的信息
    console.log(startStr + '\033[40;33m' + msg + '\033[0m');
    appendFileSync(path, logINFO, 'utf8');
  } else if (type.toLowerCase() == 'done') {
    // 输出服务器启动的信息
    console.log('\033[42;30m DONE \033[40;32m 服务器启动成功 http://www.localhost:' + msg + '\033[0m');
    appendFileSync(path, '[INFO][' + time + '] 服务器启动成功，端口为' + msg + EOL, 'utf8');
  }
}

module.exports.ioLog = ioLog;
