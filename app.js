const express = require("express");

const app = express();
app.use(express.json());

const apiRouter = require("./routers/api-routers");

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
