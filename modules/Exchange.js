const request = require('request');

class Exchange {

    constructor(operator) {
        this.operator = operator;
    }

    getCoinsLastPrices() {
        this.operator.getCoinsLastPrices();
    }

    socketCoinsLivePrices() {
        return "socket coins live prices";
    }

    getRialMarketInfo() {
        const options = {
            url: 'http://94.130.10.13:8000/',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8'
            }
        };

        return new Promise(function (resolve, reject) {
            request(options, function (err, res, body) {
                let json = JSON.parse(body);
                json.fee.buy.D = '0';
                json.fee.sell.D = '0';
                resolve(json);
            });
        });
    }

}

module.exports = Exchange;