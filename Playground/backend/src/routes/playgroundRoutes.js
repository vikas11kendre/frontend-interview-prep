const express = require("express");
const router = express.Router();
const {
  getCachedData,
  longPoll,
  triggerUpdate,
  getPollingData,
  getSse,
} = require("../controllers/playgroundController");

// Caching demo
router.get("/cached", getCachedData);

// Long-polling demo
router.get("/long-poll", longPoll);
router.get("/long-poll/update", triggerUpdate);
router.get("/sse",getSse)
// Short polling / counter demo
router.get("/data", getPollingData);

module.exports = router;
