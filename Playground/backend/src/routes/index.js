const express = require("express");
const router = express.Router();

const playgroundRoutes = require("./playgroundRoutes");

// Mount topic-specific routers here as the project grows
// Example: router.use("/auth", require("./authRoutes"));
//          router.use("/dsa", require("./dsaRoutes"));

router.use("/playground", playgroundRoutes);

module.exports = router;
