const express = require("express");
const {
  getTopics,
  getArticleById,
  patchArticleById,
  getUsers,
  getComments,
  getArticles,
  postComment,
} = require("./controllers/app.controllers");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/users", getUsers);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getComments);

app.get("/api/articles", getArticles);

app.post("/api/articles/:article_id/comments", postComment);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Input!" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Article does not exist" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Service Error" });
});

module.exports = app;
