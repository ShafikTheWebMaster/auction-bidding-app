// src/services/SocketService.js

class SocketService {
  constructor(io) {
    this.io = io; // Socket.IO server instance
    this.items = new Map();
    this.agents = [];
  }

  registerItem(item) {
    this.items.set(item.id, item);
  }

  registerAgent(agent) {
    this.agents.push(agent);
  }

  // Initialize network event listeners
  init() {
    this.io.on("connection", (socket) => {
      console.log(`[Socket Connected] ID: ${socket.id}`);

      // Allow client to join an isolated item room
      socket.on("joinItemRoom", (itemId) => {
        socket.join(itemId);
        const item = this.items.get(itemId);
        if (item) {
          socket.emit("itemState", item.getSummary());
        }
      });

      // Handle incoming real-time bid from network client
      socket.on("placeBid", ({ itemId, bidder, amount }) => {
        const item = this.items.get(itemId);
        if (!item) {
          return socket.emit("bidError", { message: "Item not found." });
        }

        const result = item.placeBid(bidder, amount);
        if (!result.success) {
          return socket.emit("bidError", { reason: result.reason });
        }

        bidder.recordBid(itemId, amount);

        // Broadcast to all clients viewing this item room
        this.io.to(itemId).emit("bidUpdated", {
          itemSummary: item.getSummary(),
          timestamp: new Date().toISOString()
        });

        // Trigger proxy bidding agents
        this.triggerAgents(item);
      });

      socket.on("disconnect", () => {
        console.log(`[Socket Disconnected] ID: ${socket.id}`);
      });
    });
  }

  triggerAgents(item) {
    const relevantAgents = this.agents.filter(
      (agent) => agent.itemId === item.id && agent.isActive
    );

    for (const agent of relevantAgents) {
      const agentResult = agent.evaluateAndBid(item);
      if (agentResult.actionTaken) {
        this.io.to(item.id).emit("agentBidPlaced", {
          agentId: agent.id,
          bidAmount: agentResult.bidAmount,
          itemSummary: item.getSummary()
        });
      }
    }
  }
}

module.exports = SocketService;