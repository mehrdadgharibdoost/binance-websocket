const BinanceApi = require("./binance/lib/binance");
const request = require('request');
const http = require("http").createServer();
const io = require("socket.io")(http);
const _ = require('lodash');
const binanceWS = new BinanceApi.BinanceWS(true);
const binanceRest = new BinanceApi.BinanceRest({
    key: 'api-key',
    secret: 'api-secret',
    timeout: 15000,
    recvWindow: 10000,
    disableBeautification: false,
    handleDrift: false
});

class BinanceEx {

    getCoinsLastPrices() {

        var output = [];
        var tickerPrice = binanceRest.tickerPrice();
        var assetsInfo = this.getAssetsInfo();

        return new Promise(function (resolve, reject) {
            tickerPrice.then(result => {
                var dataBTC = _.find(result, function (resultItem) {
                    return "BTCUSDT" == resultItem.symbol;
                });

                assetsInfo.forEach(assetItem => {
                    var dataAsset = _.find(result, function (resultItem) {
                        return assetItem.price_symbol == resultItem.symbol;
                    });

                    var price_in_usdt = assetItem.price_symbol_unit == "USDT" ? dataAsset.price : dataAsset.price * dataBTC.price;
                    var price_in_btc = assetItem.price_symbol_unit == "BTC" ? dataAsset.price : dataAsset.price / dataBTC.price;

                    output.push({
                        "asset": assetItem.asset,
                        "price_symbol": assetItem.price_symbol,
                        "price_symbol_unit": assetItem.price_symbol_unit,
                        "price_in_usdt": price_in_usdt.toString(),
                        "price_in_btc": price_in_btc.toString()
                    });
                });

                resolve(output);
            });
        });
    }

    socketCoinsLivePrices(port, domain) {

        http.listen(port, () => {
            console.log("Server is listening on 127.0.0.1:" + port);
        });

        io.of("/" + domain).on("connection", (socket) => {

            var assetsInfo = this.getAssetsInfo();
            var assetPriceHistory = [];

            var coinsLastPrices = this.getCoinsLastPrices();
            var rialMarketInfo = this.getRialMarketInfo();

            Promise.all([coinsLastPrices, rialMarketInfo]).then(promiseResults => {
                var coinsLastPricesResult = promiseResults[0];
                var rialMarketInfo = promiseResults[1];

                binanceWS.onAllTickers((tickerData) => {
                    var output = [];
                    assetsInfo.forEach(assetItem => {
                        var dataAsset = _.find(tickerData, function (tickerItem) {
                            return assetItem.price_symbol == tickerItem.symbol;
                        });

                        if (_.isNil(dataAsset)) {
                            var dataAsset = _.find(coinsLastPricesResult, function (coinItem) {
                                return assetItem.asset == coinItem.asset;
                            });

                            var price_in_usdt = dataAsset.price_in_usdt;
                            var price_in_btc = dataAsset.price_in_btc;
                        } else {
                            var dataBTC = _.find(coinsLastPricesResult, function (coinItem) {
                                return "BTC" == coinItem.asset;
                            });

                            var price_in_usdt = assetItem.price_symbol_unit == "USDT" ? dataAsset.currentClose : dataAsset.currentClose * dataBTC.price_in_usdt;
                            var price_in_btc = assetItem.price_symbol_unit == "BTC" ? dataAsset.currentClose : dataAsset.currentClose / dataBTC.price_in_usdt;
                        }

                        if (!_.isNil(assetPriceHistory[assetItem.asset]) && assetPriceHistory[assetItem.asset].length >= 2) {
                            assetPriceHistory[assetItem.asset].shift();
                            assetPriceHistory[assetItem.asset].push(price_in_usdt);
                        } else {
                            assetPriceHistory[assetItem.asset] = [];
                            assetPriceHistory[assetItem.asset].push(price_in_usdt, price_in_usdt);
                        }

                        var priceStatus = "";
                        if (assetPriceHistory[assetItem.asset][1] > assetPriceHistory[assetItem.asset][0]) {
                            priceStatus = "positive";
                        } else {
                            priceStatus = "negative";
                        }

                        var usdt_in_rial_for_buy_coin = '';
                        var usdt_in_rial_for_sell_coin = '';

                        var price_buy_in_rial = '';
                        var price_sell_in_rial = '';

                        if (assetItem.asset == "USDT") {
                            var price_buy_in_rial = rialMarketInfo.price['orig-buy-price'];
                            var price_sell_in_rial = rialMarketInfo.price['orig-sell-price'];
                        } else {
                            var usdt_in_rial_for_buy_coin = rialMarketInfo.price['orig-buy-price'] + rialMarketInfo.price['orig-buy-price'] * rialMarketInfo.fee.sell[assetItem.group] / 100;
                            var usdt_in_rial_for_sell_coin = rialMarketInfo.price['orig-buy-price'] - rialMarketInfo.price['orig-buy-price'] * rialMarketInfo.fee.sell[assetItem.group] / 100;
                            var price_buy_in_rial = price_in_usdt * usdt_in_rial_for_buy_coin;
                            var price_sell_in_rial = price_in_usdt * usdt_in_rial_for_sell_coin;
                        }

                        output.push({
                            "asset": assetItem.asset,
                            "price_symbol": assetItem.price_symbol,
                            "price_symbol_unit": assetItem.price_symbol_unit,
                            "price_in_usdt": price_in_usdt.toString(),
                            "price_in_btc": price_in_btc.toString(),
                            "price_buy_in_rial": price_buy_in_rial.toString(),
                            "price_sell_in_rial": price_sell_in_rial.toString(),
                            "price_status": priceStatus
                        });

                        // console.log(output);
                        io.of("/" + domain).emit('tickerUpdate', output);
                    });
                });
            }).catch(err => {
                console.log(err);
            });

        });
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

    getAssetsInfo() {
        return [
            {
                "asset": "BTC",
                "price_symbol": "BTCUSDT",
                "price_symbol_unit": "USDT",
                "group": "A"
            },
            {
                "asset": "BNB",
                "price_symbol": "BNBUSDT",
                "price_symbol_unit": "USDT",
                "group": "B"
            },
            {
                "asset": "TRX",
                "price_symbol": "TRXBTC",
                "price_symbol_unit": "BTC",
                "group": "C"
            },
            {
                "asset": "XRP",
                "price_symbol": "XRPBTC",
                "price_symbol_unit": "BTC",
                "group": "D"
            },
            {
                "asset": "LTC",
                "price_symbol": "LTCBTC",
                "price_symbol_unit": "BTC",
                "group": "D"
            },
            {
                "asset": "QKC",
                "price_symbol": "QKCBTC",
                "price_symbol_unit": "BTC",
                "group": "C"
            }
        ];
    }

}

module.exports = BinanceEx;