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

const getSse=(req,res)=>{
  console.log("request recieved");
    res.setHeader("Content-Type","text/event-stream");
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Connection","keep-alive");
    const interval =setInterval(()=>{
      const data= {message:"hello",time: new Date().toISOString()};
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    },2000);
    req.on("close",()=>{
      clearInterval(interval)
    })
}

module.exports = {
  getCachedData,
  longPoll,
  triggerUpdate,
  getPollingData,
  getSse
};
