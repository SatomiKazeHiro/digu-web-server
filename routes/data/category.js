const express = require("express");
const categoryRouter = express.Router();
const { processKey } = require("../../routine/key-map");
const Response = require("../utils/response");

const {
  RESOURCES_PATH,
  _TOOLS: TOOLS,
  _DB_TOOLS: { resourcesDB },
} = process[processKey];

categoryRouter.post("/get", (req, res) => {
  try {
    const { fields, area, category } = req.body;

    if (fields && !Array.isArray(fields)) return Response.warn(res, "fields: 非数组");

    let detail = resourcesDB.getCategory(area, category, fields);
    Response.success(res, { category: detail });
  } catch (error) {
    Response.error(res, error);
  }
});

module.exports = categoryRouter;
