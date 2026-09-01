// src/index.js

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const Item = require("./models/Item");
const Bidder = require("./models/Bidder");
const Agent = require("./models/Agent");
const SocketService = require("./services/SocketService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 1. Initialize Socket.IO Service
const socketService = new SocketService(io);
socketService.init();

// 2. Setup Mock Data
const watch = new Item({
  id: "item-101",
  name: "Vintage Rolex Submariner",
  description: "1978 rare collector item",
  startingBid: 500,
  minIncrement: 50
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

// Express REST Endpoint to check server status
app.get("/status", (req, res) => {
  res.json({ status: "Online", activeItem: watch.getSummary() });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`=== Real-Time Auction Server running on http://localhost:${PORT} ===`);
});