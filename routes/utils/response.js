class Response {
  static success = (res, details) => {
    res && res.send({ code: 200, details });
  };
  static warn = (res, msg) => {
    res && res.send({ code: 400, msg });
  };
  static error = (res, msg) => {
    if (msg instanceof Error) msg = msg.toString();
    res && res.send({ code: 500, msg });
  };
}

module.exports = Response;
