class Agent {
    constructor({ id, bidder, itemId, maxBudget}) {
        this.id = id;
        this.bidder = bidder; // Instance of Bidder
        this.itemId = itemId; // ID of the item to bid on
        this.maxBudget = maxBudget; // Maximum budget for bidding
        this.isActive = true; // Indicates if the agent is still active in the auction
        this.totalBidsPlaced = 0; // Track the number of bids placed by the agent
    }

    // Evaluate current item bid and decides whether to out-bid
    evaluateAndBid(item) {
        if (!this.isActive || item.isClosed) {
            return {
                actionToken: false,
                reason: "Agent inactive or auction closed"
            };
        }

        // dot't out bid ypurself
        if (item.highestBidder && item.highestBidder.id === this.bidder.id) {
            return {
                actionToken: false,
                reason: "Agent is already the highest bidder"
            };
        }

        const nextRequiredBid = item.highestBidder 
        ? item.currentBid + item.minIncrement
        : item.Agent.startingBid;

        //Verify next bid does'nt exceed agent budget or user wallet balance

        if (nextRequiredBid > this.maxBudget) {
            this.isActive = false; // Deactivate agent if budget exceeded
            return {
                actionToken: false,
                reason: "Required bid exceeds agent's max budget."
            };
        }

        if (nextRequiredBid > this.bidder.walletBalance) {
            this.isActive = false;
            return {
                actionToken: false,
                reason: "Insufficient wallet balance."
            };
        }

        const bidResult = item.placeBid(this.bidder, nextRequiredBid);

        if (bidResult.success) {
            this.bidder.recordBid(item.id, nextRequiredBid);
            this.totalBidsPlaced += 1;
            return {
                actionTaken: true,
                bidAmount: nextRequiredBid,
                itemSummary: item.getSummary()
            };
        }

        return { actionTaken: false, reason:bidResult.reason};

    }

    deactivate(){
        this.isActive = false;
    }

    getSummary() {
        return {
            id: this.id,
            bidderId: this.bidder.id,
            itemId: this.itemId,
            maxBudget: this.maxBudget,
            isActive: this.isActive,
            totalBidsPlaced: this.totalBidsPlaced
        };

    }
}

module.exports = Agent;