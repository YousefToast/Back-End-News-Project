const seed = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");
const app = require("../app");

beforeEach(() => seed(testData));
afterAll(() => db.end());
const hour = 3600000;
const timeDate = function (num) {
  return JSON.stringify(new Date(num - hour)).slice(1, -1);
};

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
  test("Status:200, responds with object of specified article", () => {
    const articleObject = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: timeDate(1594329060000),
      //not an ideal solution to just take off an hour but the best i could do at the moment
      votes: 100,
    };
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(articleObject);
      });
  });

  test("Status:404, responds with error message when passed non existent api request", () => {
    return request(app)
      .get("/api/articles/420")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article does not exist for article id: 420");
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
        expect(res.body.msg).toBe("Article does not exist for article id: 360");
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
