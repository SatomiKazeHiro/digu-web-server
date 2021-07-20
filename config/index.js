// 服务器启动端口号
const port = 2233;
// 资源目录不扫描item项目的area列表
const excludeScanItemDir = ['game']
// 配置文件路径生成
let initLogPath = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';
let startLogPath = './logs/start ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';

module.exports.port = port;
module.exports.excludeScanItemDir = excludeScanItemDir;
module.exports.initLogPath = initLogPath;
module.exports.startLogPath = startLogPath;

