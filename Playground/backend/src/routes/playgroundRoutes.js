const express = require("express");
const router = express.Router();
const {
  getCachedData,
  longPoll,
  triggerUpdate,
  getPollingData,
} = require("../controllers/playgroundController");

// Caching demo
router.get("/cached", getCachedData);

// Long-polling demo
router.get("/long-poll", longPoll);
router.get("/long-poll/update", triggerUpdate);

// Short polling / counter demo
router.get("/data", getPollingData);

module.exports = router;
