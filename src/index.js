// src/index.js

const Item = require("./models/Item");
const Bidder = require("./models/Bidder");
const Agent = require("./models/Agent");
const SocketService = require("./services/SocketService");

console.log("=== Starting Real-Time Auction System ===\n");

// 1. Initialize Real-Time Socket Service
const socketService = new SocketService();

// 2. Instantiate Auction Item
const vintageWatch = new Item({
  id: "item-101",
  name: "Vintage Rolex Submariner",
  description: "1978 rare collector item",
  startingBid: 500,
  minIncrement: 50,
  durationInSeconds: 300
});
socketService.registerItem(vintageWatch);

// 3. Instantiate Bidders
const bidderAlice = new Bidder({ id: "usr-1", name: "Alice", walletBalance: 2000 });
const bidderBob = new Bidder({ id: "usr-2", name: "Bob", walletBalance: 1500 });

// 4. Instantiate Automated Proxy Agent for Bob
const bobsAgent = new Agent({
  id: "agent-bob-1",
  bidder: bidderBob,
  itemId: vintageWatch.id,
  maxBudget: 800
});
socketService.registerAgent(bobsAgent);

// 5. Simulate Client Connection (Fixed Variable Names)
console.log(socketService.handleConnection("soc-1", bidderAlice.name));
console.log(socketService.handleConnection("soc-2", bidderBob.name));
console.log("\n--- Initial Item State ---");
console.log(vintageWatch.getSummary());

// 6. Simulation Routine
console.log("\n--- Bidding Simulation ---");

// Action 1: Alice places initial bid of $500
console.log("\n[Action] Alice places bid of $500:");
const event1 = socketService.handlePlaceBid("soc-1", {
  itemId: vintageWatch.id,
  bidder: bidderAlice,
  amount: 500
});
console.log("Event Broadcast:", JSON.stringify(event1, null, 2));

// Action 2: Alice places higher bid of $600 (Triggers Bob's Auto-Agent)
console.log("\n[Action] Alice places higher bid of $600:");
const event2 = socketService.handlePlaceBid("soc-1", {
  itemId: vintageWatch.id,
  bidder: bidderAlice,
  amount: 600
});
console.log("Event Broadcast:", JSON.stringify(event2, null, 2));

// 7. Final Summaries
console.log("\n--- Final System State ---");
console.log("Item Summary:", vintageWatch.getSummary());
console.log("Alice Wallet & Bids:", bidderAlice.getSummary());
console.log("Bob Wallet & Bids:", bidderBob.getSummary());
console.log("Bob's Agent State:", bobsAgent.getSummary());