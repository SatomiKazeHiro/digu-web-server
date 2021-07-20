const fs = require('fs');

let areaArr = JSON.parse(fs.readFileSync('./sources/sources.log.json')).dir;

let webMiddleware = function (req, res, next) {
  if (req.params.area == 'favicon.ico') return;
  if (areaArr.includes(req.params.area)) next();
  else return res.redirect("/404");
}

let dataMiddleware = function (req, res, next) {
  if (req.params.area == 'favicon.ico') return;
  if (areaArr.includes(req.params.area)) next();
  else return res.redirect("/404");
}

module.exports.webMiddleware = webMiddleware;
module.exports.dataMiddleware = dataMiddleware;
