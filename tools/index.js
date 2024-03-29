const process = require("process");

const ioLog = require("./io-log"),
  memory = require("./memory"),
  { sortAsWin, sortObjNameAsWin } = require("./sort"),
  { getSizeAndAmount } = require("./folder-tool"),
  { sources } = require("./sqlTool");

// 工具
let toolsLoader = () => {
  process.__tools = new Object();
  process.__tools.ioLog = ioLog;
  process.__tools.memory = memory;
  process.__tools.sortAsWin = sortAsWin;
  process.__tools.sortObjNameAsWin = sortObjNameAsWin;
  process.__tools.getSizeAndAmount = getSizeAndAmount;
};

// 数据库
let sqlLoader = () => {
  process.__sql = new Object();
  process.__sql.SOURCES_SQL_TOOL = sources;
};

module.exports.toolsLoader = toolsLoader;
module.exports.sqlLoader = sqlLoader;
