
class Exchange {

    constructor(operator) {
        this.operator = operator;
    }

    getCoinsPrices() {
        return "get coins prices";
    }

    getCoins() {
        return "get coins";
    }

    getMarkets() {
        return "get markets";
    }

    socketCoinsLivePrices() {
        return "socket coins live prices";
    }

}

module.exports = Exchange;