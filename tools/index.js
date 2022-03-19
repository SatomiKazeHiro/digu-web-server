const process = require("process");
const ioLog = require("./ioLog");
const init = require("./init");
const memory = require("./memory");
const SqlTool = require("./SqlTool");

// 方法加载器
let funcLoader = function () {
  process.__func = new Object();
  process.__func.ioLog = ioLog;
  process.__func.init = init;
  process.__func.memory = memory;
}

// 类加载器
let classLoader = function () {
  process.__class = new Object();
  process.__class.SqlTool = SqlTool;
}

module.exports.funcLoader = funcLoader;
module.exports.classLoader = classLoader;
