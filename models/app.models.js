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
      `SELECT comments.comment_id, comments.body, comments.votes, comments.author, comments.created_at FROM comments \
      WHERE comments.article_id = $1
      ORDER BY comments.created_at ASC;`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.selectArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  p = 1,
  limit = 10
) => {
  if (!["created_at", "votes", "author", "comment_count"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Sort Query!" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid Order Query!" });
  }
  if (!(Number(limit) > 0)) {
    return Promise.reject({ status: 400, msg: "Invalid Limit Query!" });
  }
  if (!(Number(p) > 0)) {
    return Promise.reject({ status: 400, msg: "Invalid Page Query!" });
  }

  let extraQueryValues = [limit, (p - 1) * limit];
  let queryValues = [];
  let searchStr = "";
  if (topic !== undefined) {
    searchStr = " WHERE articles.topic = $1";
    queryValues.push(topic);
  }

  let queryStr = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments
  ON comments.article_id = articles.article_id
  ${searchStr} 
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order}
  LIMIT $${1 + queryValues.length} OFFSET $${2 + queryValues.length};`;

  const articles = db.query(queryStr, [...queryValues, ...extraQueryValues]);

  const numberOfArticles = db.query(
    `SELECT COUNT(*) AS total_count FROM articles 
    ${searchStr};
    `,
    queryValues
  );
  return Promise.all([articles, numberOfArticles]).then(
    ([articleResult, numberOfArticlesResult]) => {
      if (articleResult.rows.length === 0 && topic) {
        return db
          .query("SELECT * FROM topics WHERE topics.slug = $1", [topic])
          .then((result) => {
            if (result.rows.length === 0) {
              return Promise.reject({
                status: 404,
                msg: "topic does not exist",
              });
            }
          });
      }
      if (
        numberOfArticlesResult.rows[0] !== "0" &&
        articleResult.rows.length === 0
      ) {
        return Promise.reject({
          status: 404,
          msg: "Page Not Found!",
        });
      }
      return [articleResult.rows, numberOfArticlesResult.rows[0].total_count];
    }
  );
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

exports.removeComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Comment ${comment_id} does not exist!`,
        });
      }
      return result.rows;
    });
};

exports.findUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1;", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `user ${username} not found`,
        });
      }
      return result.rows[0];
    });
};

exports.updateCommentVotes = (comment_id, editVotes) => {
  const { inc_votes } = editVotes;
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `comment ${comment_id} not found`,
        });
      }
      return result.rows[0];
    });
};

exports.insertArticle = (addArticle) => {
  const { title, topic, author, body } = addArticle;
  if (
    Object.keys(addArticle).length !== 4 ||
    body === undefined ||
    title === undefined ||
    topic === undefined ||
    author === undefined
  ) {
    return Promise.reject({ status: 400, msg: "Invalid Body Content!" });
  }
  return db
    .query(
      "INSERT INTO articles ( author, title, body, topic) VALUES ($1, $2, $3, $4) RETURNING *;",
      [author, title, body, topic]
    )
    .then((result) => {
      result.rows[0].comment_count = 0;
      return result.rows[0];
    });
};
