const {
  selectTopics,
  selectArticleById,
  selectUsers,
  updateArticleById,
  selectArticleComments,
  selectArticles,
  createComment,
  removeComment,
  findUsername,
  updateCommentVotes,
  insertArticle,
} = require("../models/app.models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  updateArticleById(article_id, req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [selectArticleComments(article_id)];
  if (article_id) promises.push(selectArticleById(article_id));

  Promise.all(promises)
    .then((results) => {
      const comments = results[0];
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, p, limit } = req.query;
  selectArticles(sort_by, order, topic, p, limit)
    .then((articles) => {
      res.status(200).send({ articles: articles[0], total_count: articles[1] });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  createComment(req.body, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then((comment) => {
      res.status(204).send({ comment });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  findUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  updateCommentVotes(comment_id, req.body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  insertArticle(req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
