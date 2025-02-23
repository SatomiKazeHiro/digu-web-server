const express = require("express");
const dataRouter = express.Router();

dataRouter.use("/category", require("./category"));
dataRouter.use("/item", require("./item"));
dataRouter.use("/dict", require("./dict"));

module.exports = dataRouter;
