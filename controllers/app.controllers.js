const {
  selectTopics,
  selectArticleById,
  changeArticleById,
} = require("../models/app.models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  changeArticleById(article_id, req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
