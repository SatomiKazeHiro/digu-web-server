const process = require("process")

var mem = process.memoryUsage(msg);
var format = function (bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + 'MB';
};
console.log(msg ? msg : '' + ' => Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

