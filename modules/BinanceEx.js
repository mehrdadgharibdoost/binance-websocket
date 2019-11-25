const BinanceApi = require("./binance/lib/binance");
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

    socketCoinsLivePrices() {

        var assetsInfo = this.getAssetsInfo();
        var assetPriceHistory = [];

        this.getCoinsLastPrices().then(function (coinsLastPricesResult) {

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

                    output.push({
                        "asset": assetItem.asset,
                        "price_symbol": assetItem.price_symbol,
                        "price_symbol_unit": assetItem.price_symbol_unit,
                        "price_in_usdt": price_in_usdt.toString(),
                        "price_in_btc": price_in_btc.toString(),
                        "price_status": priceStatus
                    });

                    console.log(output);

                });
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