const terminalLog = require("../tools/terminal-log"),
  memoryUsage = require("../tools/memory-usage"),
  sortAsWin = require("../tools/sort-as-win"),
  cyr53 = require("../tools/cyr53"),
  formatBytes = require("../tools/format-bytes");

const ToolLoader = function ({ processKey }) {
  if (process[processKey]) {
    process[processKey]._TOOLS = {
      terminalLog,
      memoryUsage,
      sortAsWin,
      cyr53,
      formatBytes,
    };
  }
};

module.exports = ToolLoader;
