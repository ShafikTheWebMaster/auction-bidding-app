const Item  = require("./models/Item");
const Bidder = require("./models/Bidder");
const Agent  = require("./models/Agent");
const SocketService = require("./services/SocketService");

console.log("=== starting Real-Time Auction System ===\n");

//1. Instantialize Real-Time Socket Service 
const socketService = new SocketService();

//2. Instantiate Auction Item 
const vintageWatch = new Item({
    id: "item-101",
    name: "Vintage Rolex Watch",
    description: "1978 rare collection item",
    startingBid: 500,
    minIncrement: 50,
    durationInSeconds: 300

});

socketService.registerItem(vintageWatch);

//3. Instantiate Bidders
const bidderAlice = new Bidder({ id: "bidder-1", name: "Alice", walletBalance: 2000 });
const bidderBob = new Bidder({ id: "bidder-2", name: "Bob", walletBalance: 1500 }); 

//4. Instantiate Automated Proxy Agent for Bob
// Bob sets an automated agent with a max budget of $800

const bobAgent = new Agent({
    id: "agent-bob-1",
    bidder: bidderBob,
    itemId: vintageWatch.id,
    maxBudget: 800  
});
socketService.registerAgent(bobAgent);

//5. Simulate Client Connection
console.log(socketService.handleConnection("socket-1", Alice.name));
console.log(socketService.handleConnection("socket-2", Bob.name));
console.log("\n--- Initial Item State --");
console.log(vintageWatch.getSummary());

//6. Simulate Routine
console.log("\n--- Simulating Bidding Actions ---");

//.Action 1: Alice places a bid of $500
console.log("\nAction 1: Alice places a bid of $500:");
const event1 = socketService.handlePlaceBid("socket-1", {
    itemId: vintageWatch.id,
    bidder: bidderAlice,
    amount: 500
});

console.log("Event Broadcast:", JSON.stringify(event1, null, 2));

//Action 2: Alice places another bid of $600( Triggers Bob's Auto-Agent)

console.log("\nAction 2: Alice places a bid of $600:");
const event2 = socketService.handlePlaceBid("socket-1", {
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