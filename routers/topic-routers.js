const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/app.controllers");

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
