const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const boolParser = require("express-query-boolean");
const path = require("path");
const { limiterAPI } = require("./helpers/constans");
require("dotenv").config();
const UPLOAD_DIR = process.env.UPLOAD_DIR;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(helmet());
app.use(express.static(path.join(__dirname, UPLOAD_DIR)));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: 10000 }));
app.use(boolParser());

app.use("app/", rateLimit({ limiterAPI }));
app.use("/api/", require("./routes/api"));

app.use((req, res) => {
  res.status(404).json({ status: "error", code: 404, message: "Not found" });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    status: status === 500 ? "fail" : "error",
    code: status,
    message: err.message.replace(/"/gi, ""),
  });
});

module.exports = app;
