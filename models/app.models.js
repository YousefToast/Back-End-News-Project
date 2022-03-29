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

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  if (!["created_at", "votes", "author"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Sort Query!" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid Order Query!" });
  }
  let queryValues = [];
  let searchStr = "";
  if (topic !== undefined) {
    searchStr = " WHERE articles.topic = $1";
    queryValues.push(topic);
  }

  let queryStr = `SELECT * FROM articles 
  ${searchStr} 
  ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr, queryValues).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "topic does not exist" });
    }
    return result.rows;
  });
};
