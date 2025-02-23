const portfinder = require("portfinder");
const express = require("express");
const server = new express();

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

const OpenServer = function ({ serverPort, resourcesPath }) {
  portfinder.setBasePort(serverPort);
  portfinder
    .getPortPromise()
    .then((port) => {
      server.use("/resource", express.static(resourcesPath));

      let dataRouter = require("../routes/data/index.js");
      server.use("/api", dataRouter);

      server.get("*", (req, res) => res.send("404"));

      server.listen(port, () => {
        console.log("服务启动，端口：", port);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = OpenServer;
