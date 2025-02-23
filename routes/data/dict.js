const express = require("express");
const dictRouter = express.Router();
const { processKey } = require("../../routine/key-map");
const Response = require("../utils/response");

const {
  RESOURCES_PATH,
  _TOOLS: TOOLS,
  _DB_TOOLS: { resourcesDB },
} = process[processKey];

const dictFuncMap = {
  area: () => resourcesDB.getAreaDict(),
  category: () => resourcesDB.getCategoryDict(),
};

dictRouter.post("/get", (req, res) => {
  try {
    const { dicts } = req.body;

    if (!dicts) return Response.warn(res, "dicts: 未传");
    else if (!Array.isArray(dicts)) return Response.warn(res, "dicts: 非数组");

    const details = {};
    for (let i = 0; i < dicts.length; i++) {
      let name = dicts[i];
      if (name in dictFuncMap) details[name] = dictFuncMap[name]();
    }

    Response.success(res, details);
  } catch (error) {
    Response.error(res, error);
  }
});

module.exports = dictRouter;
