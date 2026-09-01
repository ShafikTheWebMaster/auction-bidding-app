// src/index.js

const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");

const Item = require("./models/Item");
const Bidder = require("./models/Bidder");
const Agent = require("./models/Agent");
const SocketService = require("./services/SocketService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve public directory
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Explicit route fallback for index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// 1. Initialize Socket.IO Service
const socketService = new SocketService(io);
socketService.init();

// 2. Setup Data
const watch = new Item({
  id: "item-101",
  name: "Vintage Rolex Submariner",
  description: "1978 rare collector item",
  startingBid: 500,
  minIncrement: 50,
  durationInSeconds: 3600
});
socketService.registerItem(watch);

const bob = new Bidder({ id: "usr-2", name: "Bob", walletBalance: 1500 });
const bobsAgent = new Agent({
  id: "agent-bob-1",
  bidder: bob,
  itemId: watch.id,
  maxBudget: 800
});
socketService.registerAgent(bobsAgent);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`=== Real-Time Auction Server running on http://localhost:${PORT} ===`);
});