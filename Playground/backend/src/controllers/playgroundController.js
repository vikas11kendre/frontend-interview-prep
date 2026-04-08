let counter = 0;
let data = null;
let clients = [];

const getCachedData = (req, res) => {
  res.set("Cache-Control", "public, max-age=3");
  res.json({ message: "This is cached data" });
};

const longPoll = (req, res) => {
  if (data) {
    return res.json(data);
  }

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
};

const triggerUpdate = (req, res) => {
  data = {
    message: "New Data!",
    time: new Date(),
  };

  clients.forEach((client) => client.json(data));
  clients = [];
  data = null;

  res.send("Data sent to all clients");
};

const getPollingData = (req, res) => {
  res.json({
    value: counter++,
    time: new Date(),
  });
};

module.exports = {
  getCachedData,
  longPoll,
  triggerUpdate,
  getPollingData,
};
