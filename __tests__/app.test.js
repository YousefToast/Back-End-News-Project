const seed = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");
const app = require("../app");
const JSONendpoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());
const hour = 3600000;
const timeDate = function (num) {
  return JSON.stringify(new Date(num - hour)).slice(1, -1);
};
const timeDateTimeZone = function (num) {
  return JSON.stringify(new Date(num)).slice(1, -1);
};
const timeNow = Date.now();

describe("GET /api/topics", () => {
  test("Status:200, responds with an array of objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(res.body.topics).toBeInstanceOf(Array);
        expect(res.body.topics).toHaveLength(3);
        res.body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  const getArticleObject = {
    article_id: 1,
    title: "Living in the shadow of a great man",
    topic: "mitch",
    author: "butter_bridge",
    body: "I find this existence challenging",
    created_at: timeDate(1594329060000),
    votes: 100,
    comment_count: "11",
  };

  test("Status:200, responds with object of the chosen article including the comments.", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(getArticleObject);
      });
  });

  test("Status:404, responds with error message when passed non existent api request", () => {
    return request(app)
      .get("/api/articles/420")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article 420 does not exist");
      });
  });

  test("Status:400, responds with error message when passed a bad data type request.", () => {
    return request(app)
      .get("/api/articles/PailShrelington")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });
});

describe("GET /api/users", () => {
  test("Status: 200, responds with an array of objects containing all the users.", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        expect(res.body.users).toBeInstanceOf(Array);
        expect(res.body.users).toHaveLength(4);
        res.body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
            })
          );
        });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  const updateArticleInc = {
    inc_votes: 6,
  };
  const updateArticleDec = {
    inc_votes: -30,
  };

  test("Status:201, responds with the updated article page with new vote count when increasing.", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(updateArticleInc)
      .expect(201)
      .then((res) => {
        expect(res.body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: timeDate(1594329060000),
          votes: 106,
        });
      });
  });

  test("Status:201, responds with the updated article page with new vote count when decreasing.", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(updateArticleDec)
      .expect(201)
      .then((res) => {
        expect(res.body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: timeDate(1594329060000),
          votes: 70,
        });
      });
  });

  test("Status:404, sends an error when passed a non existent api request", () => {
    return request(app)
      .patch("/api/articles/360")
      .send(updateArticleInc)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article 360 does not exist");
      });
  });

  test("Status:400, sends an error when passing an invalid data type for votes.", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: "PailShrelington",
      })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });
});

describe("GET /api/articles", () => {
  test("Status:200, responds with an array of objects containing all the articles.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeInstanceOf(Array);
        expect(res.body.articles).toHaveLength(10);
        expect(res.body.total_count).toBe("12");
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
          expect(typeof Number(article.comment_count)).toBe("number");
        });
      });
  });

  test("status:200, set limit = 12 to get all the articles", () => {
    return request(app)
      .get("/api/articles?limit=12")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
      });
  });

  test("status:200, set limit > 12 will still get all the 12 articles", () => {
    return request(app)
      .get("/api/articles?limit=100")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
      });
  });

  test("status:200, set limit to 5 so that page 3 has 2 articles", () => {
    return request(app)
      .get("/api/articles?limit=5&p=3")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(2);
      });
  });

  test("Status:200, responds with array of article objects in sort_by and order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("Status:200, responds with array of article objects filtered by a topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((res) => {
        res.body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });

  test("Status:200, responds with array of article objects when sorted by acceptable parameters.", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("Status:200, responds with array of article objects sorted in specific order.", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeSortedBy("created_at", {
          ascending: true,
        });
      });
  });

  test("Status:200, responds with array of article objects when sorted and filtered by acceptable parameters", () => {
    return request(app)
      .get("/api/articles?order=asc&sort_by=votes&topic=mitch")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeSortedBy("votes", {
          ascending: true,
        });
        res.body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("Status:404, responds with an error when topic is not valid filter", () => {
    return request(app)
      .get("/api/articles?topic=shrella")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("topic does not exist");
      });
  });

  test("Status:400, responds with error message when passed bad sort by request", () => {
    return request(app)
      .get("/api/articles?sort_by=pailShrelington")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Sort Query!");
      });
  });

  test("Status:404, responds with error message when exceeding page limit", () => {
    return request(app)
      .get("/api/articles?limit=12&p=5")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Page Not Found!");
      });
  });

  test("Status:400, responds with error message when passed bad order request", () => {
    return request(app)
      .get("/api/articles?order=Ajdabiya")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Order Query!");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status:200, responds with an array of comments from a specific article.", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toBeInstanceOf(Array);
        expect(res.body.comments).toHaveLength(11);
        res.body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              votes: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
            })
          );
        });
      });
  });

  test("Status:200, responds with an empty array when there are no comments on the article.", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toEqual([]);
      });
  });

  test("Status:404, responds with error when article id is not found", () => {
    return request(app)
      .get("/api/articles/1047/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article 1047 does not exist");
      });
  });

  test("Status:400, responds with error when data input is incorrect", () => {
    return request(app)
      .get("/api/articles/shrel/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  const commentObject = {
    username: "icellusedkars",
    body: "All praise Shrel!",
  };
  test("Status:201, responds with object of posted comment", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ ...commentObject, article_id: 2 })
      .expect(201)
      .then((res) => {
        expect(Date.parse(res.body.comment.created_at)).toBeGreaterThan(
          timeNow
        );
        delete res.body.comment.created_at;
        expect(res.body.comment).toEqual({
          comment_id: 19,
          article_id: 2,
          author: "icellusedkars",
          body: "All praise Shrel!",
          votes: 0,
        });
      });
  });

  test("Status:400, responds with error when there is no body.", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ author: "icellusedkars" })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("No content found");
      });
  });

  test("Status:404, responds with error when invalid id is passed", () => {
    return request(app)
      .post("/api/articles/47832/comments")
      .send(commentObject)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article does not exist");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Status:204, responds with no content once it has been deleted.", () => {
    return request(app)
      .delete("/api/comments/5")
      .expect(204)
      .then(() => {
        return db.query("SELECT * FROM comments WHERE comment_id = 5");
      })
      .then((res) => {
        expect(res.rows).toEqual([]);
      });
  });

  test("Status:404, responds with error no comment found to be deleted", () => {
    return request(app)
      .delete("/api/comments/4252")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comment 4252 does not exist!");
      });
  });

  test("Status:404, responds with error no comment found to be deleted", () => {
    return request(app)
      .delete("/api/comments/ShrelComment")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });
});

describe("GET /api", () => {
  test("status:200, respond with information about the api endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(JSONendpoints);
      });
  });
});

describe("GET /api/users/:username", () => {
  test("Status:200, responds with a user object", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then((res) => {
        expect(res.body.user).toEqual({
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        });
      });
  });

  test("Status:404, responds with error when user does not exist", () => {
    return request(app)
      .get("/api/users/shrelPail")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("user shrelPail not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  const commentUpdateInc = {
    inc_votes: 101,
  };
  const commentUpdateDec = {
    inc_votes: -4,
  };
  test("status:200, responds with the updated comment increasing", () => {
    return request(app)
      .patch("/api/comments/5")
      .send(commentUpdateInc)
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toEqual({
          comment_id: 5,
          body: "I hate streaming noses",
          votes: 101,
          author: "icellusedkars",
          article_id: 1,
          created_at: timeDateTimeZone(1604437200000),
        });
      });
  });

  test("status:200, responds with the updated comment decreasing", () => {
    return request(app)
      .patch("/api/comments/5")
      .send(commentUpdateDec)
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toEqual({
          comment_id: 5,
          body: "I hate streaming noses",
          votes: -4,
          author: "icellusedkars",
          article_id: 1,
          created_at: timeDateTimeZone(1604437200000),
        });
      });
  });

  test("Status:404, responds with error when ID is not found", () => {
    return request(app)
      .patch("/api/comments/39482")
      .send(commentUpdateInc)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("comment 39482 not found");
      });
  });

  test("Status:400, responds with error when url is passed bad data type", () => {
    return request(app)
      .patch("/api/comments/shrella")
      .send({ commentUpdateDec })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });

  test("Status:400, responds with error when trying to pass invalid votes value", () => {
    return request(app)
      .patch("/api/comments/4")
      .send({ inc_votes: "PailShrelington" })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Input!");
      });
  });
});

describe("POST /api/articles", () => {
  const newArticle = {
    title: "Shrel takes over the world.",
    topic: "mitch",
    author: "icellusedkars",
    body: "At long last.",
  };
  test("status:201, responds with the new article added to the database", () => {
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((res) => {
        expect(Date.parse(res.body.article.created_at)).toBeGreaterThan(
          timeNow
        );
        delete res.body.article.created_at;
        expect(res.body.article).toEqual({
          title: "Shrel takes over the world.",
          topic: "mitch",
          author: "icellusedkars",
          body: "At long last.",
          votes: 0,
          article_id: 13,
          comment_count: 0,
        });
      });
  });

  test("status:400, returns error when there is empty body content", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "icellusedkars",
      })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Body Content!");
      });
  });

  test("status:400, respond with error message when sent invalid body content", () => {
    return request(app)
      .post("/api/articles")
      .send({
        ...newArticle,
        votes: 10,
      })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid Body Content!");
      });
  });
});
