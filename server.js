const { Interaction, ConfigLoader, Init, OpenServer } = require("./routine");
const { ServerLog } = require("./tools/terminal-log");

Interaction()
  .then((config) => {
    let { processKey, serverConfig } = ConfigLoader(config);
    Init({ processKey }).then(() => {
      OpenServer({
        serverPort: serverConfig.SERVER_PORT,
        resourcesPath: serverConfig.RESOURCES_PATH,
      });
    });
  })
  .catch((err) => {
    ServerLog.error(err);
  });
