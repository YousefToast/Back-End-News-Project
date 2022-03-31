const articlesRouter = require("express").Router();
const {
  getArticleById,
  patchArticleById,
  getArticles,
  getComments,
  postComment,
  postArticle,
} = require("../controllers/app.controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);
articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);
articlesRouter
  .route("/:article_id/comments")
  .get(getComments)
  .post(postComment);

module.exports = articlesRouter;
