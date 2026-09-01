class Item {
    constructor({id, name, description, startingBid, minIncrement = 5, durationInSeconds = 60}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startingBid = startingBid;
        this.currentBid = startingBid;
        this.highestBidder = null;
        this.minIncrement = minIncrement;
        this.isClosed = false;

        //set thw auction end time based on duration
        this.endTime = Date.now() + durationInSeconds * 1000;
    }

    // validates and applies a new bid
    placeBid(bidder, amount) {
        if(this.isClosed || Date.now() >= this.endTime) {
            this.isClosed = true;
            return { success: false, reason: 'Auction had ended' };
        }

        const minimumAllowedBid = this.currentBid  === this.startingBid && !this.highestBidder 
         ? this.startingBid 
         : this.currentBid + this.minIncrement;

        if (amount < minimumAllowedBid) {
            return {
                success: false,
                reason: `Bid must be at least $${minimumAllowedBid}.`
            };
        }
        //Update auction state 
        this.currentBid = amount;
        this.highestBidder = bidder;

        return {
            success: true,
            item: this.getSummary()
        };

    }

    // check and updates auction status
    checkAuctionStatus() {
        if (Date.now() >= this.endTime) {
            this.isClosed = true;
        }
        return this.isClosed;
    }

    //Returns a current item state summary
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            currentBid: this.currentBid,
            highestBidder: this.highestBidder ? this.highestBidder.name : "None",
            isClosed: this.checkAuctionStatus(),
            timeLeftInSeconds: Math.max(0, Math.floor((this.endTime - Date.now()) / 1000))
        };
    }

}

module.exports = Item;