const app = require("./src/app");
const http =require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);       // wrap Express
const wss = new WebSocketServer({ server }); // attach WebSocket


wss.on('connection',(ws)=>{
  ws.on('message',(message)=>{
        console.log("Received:", message.toString());
      ws.send("ok")
        const parsed = JSON.parse(message);
  if (parsed.type === "join") {
    ws.userId = parsed.userId;  // attach identity to connection
  }
      });
  ws.on("close", () => {
    console.log("Client disconnected");
  });
})
// wss.clients.forEach((client) => {
//   if (client.readyState === WebSocket.OPEN) {
//     client.send(message);
//   }
// });
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
