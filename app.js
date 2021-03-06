const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors())
app.use(express.json());

const apiRouter = require("./routers/api-routers");

app.get("/", (req, res, next) => {
  res.status(200).send({ msg: "Welcome to Shrel News" });
});

app.use("/api", apiRouter);

const {
  handleCustomErrors,
  handlePSQLErrors,
  handleServerErrors,
} = require("./errors/errors");

app.use(handleCustomErrors);
app.use(handlePSQLErrors);
app.use(handleServerErrors);

module.exports = app;
