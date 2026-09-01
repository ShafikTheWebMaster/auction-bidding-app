class Bidder{
    constructor({ id, name, walletBalance = 0 }) {
        this.id = id;
        this.name = name;
        this.walletBalance = walletBalance;
        this.bidHistory = [];       
    }

    deductFunds(amount) {
        if (amount > this.walletBalance) {
            return { success: false,
                reason: 'Insufficient funds' };
            }

        this.walletBalance -= amount;
        return { success: true, newBalance: this.walletBalance };
    }

    //Refunc
    creditFunds(amount) {
        this.walletBalance += amount;
        return { success: true, newBalance: this.walletBalance };
    }

    // Log bid action to bidder History
    recordBid(itemId, amount) {
        const record = {
            itemId,
            amount,
            timestamp: new Date().toISOString()
        };
        this.bidHistory.push(record);
        return record ;
    }

    getSummary() {
        return {
            id: this.id,
            name: this.name,
            walletBalance: this.walletBalance,
            totalBidsPlaced: this.bidHistory.length
        };
    }
}

module.exports = Bidder;