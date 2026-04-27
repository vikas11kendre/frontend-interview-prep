const express = require("express");
const router = express.Router();

const playgroundRoutes = require("./playgroundRoutes");


router.use("/playground", playgroundRoutes);

module.exports = router;
