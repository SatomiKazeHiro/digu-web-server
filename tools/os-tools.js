const os = require("os");

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces(); // 获取所有网络接口的信息

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      // 跳过内部的网络接口（例如：127.0.0.1）和非IPv4的接口
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  // return "IP address not found";
  return null;
}

module.exports = {
  getLocalIPAddress,
};
