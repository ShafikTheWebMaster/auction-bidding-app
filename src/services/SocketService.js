// src/services/SocketService.js

class SocketService {
  constructor() {
    this.clients = new Map(); // Connected client sockets: socketId -> client info
    this.items = new Map();   // Active items: itemId -> Item instance
    this.agents = [];         // Active automated agents
  }

  // Register active items in memory
  registerItem(item) {
    this.items.set(item.id, item);
  }

  // Register automated agents
  registerAgent(agent) {
    this.agents.push(agent);
  }

  // Handle new incoming client connection
  handleConnection(socketId, clientName) {
    this.clients.set(socketId, { name: clientName, connectedAt: new Date() });
    return {
      event: "connected",
      socketId,
      message: `Client ${clientName} connected successfully.`
    };
  }

  // Process incoming bid event from a user
  handlePlaceBid(socketId, { itemId, bidder, amount }) {
    const item = this.items.get(itemId);
    if (!item) {
      return { event: "error", message: "Item not found." };
    }

    // Attempt to place bid
    const result = item.placeBid(bidder, amount);

    if (!result.success) {
      return { event: "bidRejected", socketId, reason: result.reason };
    }

    // Record bid in bidder history
    bidder.recordBid(itemId, amount);

    // Broadcast updated state to all connected clients
    const updateEvent = {
      event: "bidUpdated",
      itemSummary: item.getSummary(),
      timestamp: new Date().toISOString()
    };

    // Trigger auto-bidding agents registered for this item
    this.triggerAgents(item);

    return updateEvent;
  }

  // Evaluates and triggers active agents after a manual bid occurs
  triggerAgents(item) {
    const relevantAgents = this.agents.filter(
      agent => agent.itemId === item.id && agent.isActive
    );

    for (const agent of relevantAgents) {
      const agentResult = agent.evaluateAndBid(item);
      if (agentResult.actionTaken) {
        // Broadcast auto-bid event if agent successfully placed a bid
        this.broadcast("agentBidPlaced", {
          agentId: agent.id,
          bidAmount: agentResult.bidAmount,
          itemSummary: item.getSummary()
        });
      }
    }
  }

  // Mock broadcasting events to connected clients
  broadcast(eventName, payload) {
    const packet = {
      event: eventName,
      recipients: this.clients.size,
      data: payload,
      timestamp: new Date().toISOString()
    };
    return packet;
  }

  // Handle client disconnection
  handleDisconnect(socketId) {
    const client = this.clients.get(socketId);
    this.clients.delete(socketId);
    return {
      event: "disconnected",
      socketId,
      message: client ? `${client.name} disconnected.` : "Client disconnected."
    };
  }
}

module.exports = SocketService;