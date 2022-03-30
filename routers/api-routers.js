const apiRouter = require("express").Router();
const { getApi } = require("../controllers/api.controllers");
const {
  getTopics,
  getArticleById,
  patchArticleById,
  getUsers,
  getComments,
  getArticles,
  postComment,
  deleteComment,
} = require("../controllers/app.controllers");

apiRouter.route("/").get(getApi);
apiRouter.route("/topics").get(getTopics);
apiRouter.route("/articles/:article_id").get(getArticleById);
apiRouter.route("/users").get(getUsers);
apiRouter.route("/articles/:article_id").patch(patchArticleById);
apiRouter.route("/articles/:article_id/comments").get(getComments);
apiRouter.route("/articles").get(getArticles);
apiRouter.route("/articles/:article_id/comments").post(postComment);
apiRouter.route("/comments/:comment_id").delete(deleteComment);

module.exports = apiRouter;
