const apiRouter = require("express").Router();
const articlesRouter = require("./article-routers");
const topicsRouter = require("./topic-routers");
const commentsRouter = require("./comments-routers");
const { getApi } = require("../controllers/api.controllers");
const usersRouter = require("./user-routers");

apiRouter.route("/").get(getApi);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
