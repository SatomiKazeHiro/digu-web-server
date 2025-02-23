const TerminalLog = {
  default: function (info) {
    console.log(info); // 默认，黑底白字
  },
  insert(info) {
    console.log("\033[40;36m" + info + "\033[0m"); // 黑底蓝字
  },
  delete(info) {
    console.log("\033[40;31m" + info + "\033[0m"); // 黑底红字
  },
  update(info) {
    console.log("\033[40;32m" + info + "\033[0m"); // 黑底绿字
  },
  warning(info) {
    console.log("\033[40;33m" + info + "\033[0m"); // 黑底黄字
  },
  error(info) {
    console.log("\033[40;31m" + info + "\033[0m"); // 黑底红字
  },
};

const TerminalLogProxy = new Proxy(TerminalLog, {
  get(target, property) {
    return property in target ? target[property] : target.default;
  },
});

const ServerLog = {
  start() {
    console.log("\033[44;30m INFO \033[40;34m  服务器启动中... \033[0m");
  },
  done(port) {
    console.log("\033[42;30m DONE \033[40;32m  服务器启动成功 \033[0m");
    let localUrl = "http://localhost:" + port;
    TerminalLogProxy.update("\t" + "本地：" + localUrl);
  },
  error(err) {
    let text;

    try {
      if (typeof err !== "string") {
        if (err !== null && typeof err == "object") text = JSON.stringify(err);
        else text = String(err);
      }
    } catch (error) {
      // ...
      TerminalLogProxy.error("[terminal-log.js] 发生转换错误");
      TerminalLogProxy.error(error);
    }
    // console.log("\033[41;30m ERROR \033[40;31m " + err + " \033[0m");

    if (text) {
      console.log("\033[41;37m ERROR \033[0m");
      TerminalLogProxy.error(text);
    }
  },
};

const ServerLogProxy = new Proxy(ServerLog, {
  get(target, property) {
    return property in target ? target[property] : TerminalLogProxy.default;
  },
});

module.exports = {
  TerminalLog: TerminalLogProxy,
  ServerLog: ServerLogProxy,
};
