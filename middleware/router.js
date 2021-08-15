const fs = require('fs');

let areaArr = JSON.parse(fs.readFileSync('./sources/sources.config.json')).dir;

let baseMiddleware = function (req, res, next) {
  if (req.params.area == 'favicon.ico') return;
  next();
}

let dataMiddleware = function (req, res, next) {
  if (req.params.area == 'favicon.ico') return;
  if (areaArr.includes(req.params.area)) next();
  else return res.redirect("/404");
}

let webMiddleware = function (req, res, next) {
  if (req.params.area == 'favicon.ico') return;
  if (areaArr.includes(req.params.area)) next();
  else return res.redirect("/404");
}

module.exports.baseMiddleware = baseMiddleware;
module.exports.dataMiddleware = dataMiddleware;
module.exports.webMiddleware = webMiddleware;
