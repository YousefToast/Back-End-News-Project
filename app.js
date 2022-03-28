const express = require("express");
const { getTopics } = require("./controllers/app.controllers");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Service Error" });
});

module.exports = app;
