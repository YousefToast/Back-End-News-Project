const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article does not exist for article id: ${article_id}`,
        });
      }
      return result.rows[0];
    });
};

exports.changeArticleById = (article_id, updatedArticle) => {
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
          msg: `Article does not exist for article id: ${article_id}`,
        });
      }
      return result.rows[0];
    });
};
