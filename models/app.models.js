const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      "SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles \
    LEFT JOIN comments \
    ON comments.article_id = articles.article_id \
    WHERE articles.article_id = $1 \
    GROUP BY articles.article_id;",
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article ${article_id} does not exist`,
        });
      }
      return result.rows[0];
    });
};

exports.selectUsers = () => {
  return db.query("SELECT username FROM users").then((result) => {
    return result.rows;
  });
};

exports.updateArticleById = (article_id, updatedArticle) => {
  const { inc_votes } = updatedArticle;
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;",
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article ${article_id} does not exist`,
        });
      }
      return result.rows[0];
    });
};

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      "SELECT comments.comment_id, comments.body, comments.votes, comments.author, comments.created_at FROM comments \
      WHERE comments.article_id = $1;",
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.selectArticles = () => {
  return db.query("SELECT * FROM articles").then((result) => {
    return result.rows;
  });
};

exports.createComment = (comment, article_id) => {
  const { username, body } = comment;
  if (username === undefined || body === undefined) {
    return Promise.reject({
      status: 400,
      msg: "No content found",
    });
  }
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;",
      [username, body, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
