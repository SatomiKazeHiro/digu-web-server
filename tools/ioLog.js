/**
 * 控制台输出,并写入日记文件
 */
const { EOL } = require("os");
const { appendFileSync } = require('fs');
let { startLogPath, initLogPath } = require("../config");

// 自定义打印加追加文本方法
/**
 * 输出log并保存log信息
 * @param {String} msg 需要输出的信息
 * @param {String} type 输出信息类型
 */
module.exports = ioLog = (msg, type = '') => {
  // 生成当前时间
  let time = new Date().toLocaleString().replace(/\//g, '-');
  // 开头格式字符串
  let startStr = '     - ';
  // 保存内容模板[INFO]
  let logINFO = `[INFO][${time}] ${msg}${EOL}`;
  switch (type.toLowerCase()) {
    case '':
      console.log(startStr + msg);
      break;
    case 'increase':
      // 输出系统目录增加的信息（黑底青字）
      console.log(startStr + '\033[40;36m' + msg + '\033[0m');
      appendFileSync(initLogPath, logINFO, 'utf8');
      break;
    case 'decrease':
      // 输出系统目录被移除的信息（黑底红字）
      console.log(startStr + '\033[40;31m' + msg + '\033[0m');
      appendFileSync(initLogPath, logINFO, 'utf8');
      break;
    case 'up':
      // 输出目录内容成功装载的信息（黑底绿字）
      console.log(startStr + '\033[40;32m' + msg + '\033[0m');
      appendFileSync(initLogPath, logINFO, 'utf8');
      break;
    case 'warning':
      // 输出目录内容成功装载的信息（黑底黄字）
      console.log(startStr + '\033[40;33m' + msg + '\033[0m');
      appendFileSync(initLogPath, logINFO, 'utf8');
      break;
    case 'start':
      // 输出服务器启动信息（橙底黑字-黑底橙字）
      console.log('\033[44;30m INFO \033[40;34m 服务器启动中... \033[0m');
      break;
    case 'done':
      // 输出服务器启动成功的信息（绿底黑字-黑底绿字）
      console.log('\033[42;30m DONE \033[40;32m 服务器启动成功 http://localhost:' + msg + '\033[0m');
      appendFileSync(startLogPath, '[INFO][' + time + '] 服务器启动成功，端口为' + msg + EOL, 'utf8');
      break;
  }
}
