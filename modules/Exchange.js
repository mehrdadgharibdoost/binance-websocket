const request = require('request');

class Exchange {

    constructor(operator) {
        this.operator = operator;
    }

    getCoinsLastPrices() {
        return this.operator.getCoinsLastPrices();
    }

    socketCoinsLivePrices(port, domain) {
        this.operator.socketCoinsLivePrices(port, domain);
    }

    getRialMarketInfo() {
        return this.operator.getRialMarketInfo();
    }

}

module.exports = Exchange;