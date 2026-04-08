const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// API Routes
app.use("/api/v1", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
