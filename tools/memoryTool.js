const process = require("process")

module.exports = (requestPath) => {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  };
  // heapTotal：堆的总大小，包括3个部分（已分配的内存、未分配的但可用于分配的内存、未分配的但不能分配的内存）
  // heapUsed：已分配的内存，即堆中所有对象的总大小，是heapTotal的子集
  // rss（Resident Set Size）：操作系统分配给进程的总的内存大小
  console.log(requestPath + ' => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
}
