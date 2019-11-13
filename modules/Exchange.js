
class Exchange {

    constructor(operator) {
        this.operator = operator;
    }

    getLastCoinsPrices() {
        this.operator.getLastCoinsPrices();
    }

    getLiveCoinsPrices() {
        this.operator.getLiveCoinsPrices();
    }

    socketCoinsLivePrices() {
        return "socket coins live prices";
    }

}

module.exports = Exchange;