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

    getLiveCoinsPrices() {

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

        var output = [];
        var assetsInfo = this.getAssetsInfo();

        this.getLiveCoinsPrices().then(function (liveCoinsPricesResult) {

            binanceWS.onAllTickers((tickerData) => {

                tickerDataBTC = _.find(tickerData, function (dataItem) {
                    return "BTCUSDT" == dataItem.symbol;
                });

                if (_.isNil(tickerDataBTC)) {
                    tickerDataBTC = tickerDataHistoryAsset['btc'][1];
                }
                /*
                                if (!_.isNil(tickerDataHistoryAsset['btc']) && tickerDataHistoryAsset['btc'].length >= 2) {
                                    tickerDataHistoryAsset['btc'].shift();
                                    tickerDataHistoryAsset['btc'].push(tickerDataBTC);
                                } else {
                                    tickerDataHistoryAsset['btc'] = [];
                                    tickerDataHistoryAsset['btc'].push(tickerDataBTC, tickerDataBTC);
                                }
                
                                console.log(tickerDataHistoryAsset);
                
                                livePriceAssetsInfo.forEach(item => {
                                    var tickerDataAsset = _.find(tickerData, function (tickerDataItem) {
                                        return item.price_symbol.toUpperCase() == tickerDataItem.symbol;
                                    });
                
                                    if (_.isNil(tickerDataAsset)) {
                                        tickerDataAsset = tickerDataHistoryAsset[item.asset][1];
                                    }
                
                                    if (!_.isNil(tickerDataHistoryAsset[item.asset]) && tickerDataHistoryAsset[item.asset].length >= 2) {
                                        tickerDataHistoryAsset[item.asset].shift();
                                        tickerDataHistoryAsset[item.asset].push(tickerDataAsset);
                                    } else {
                                        tickerDataHistoryAsset[item.asset] = [];
                                        tickerDataHistoryAsset[item.asset].push(tickerDataAsset, tickerDataAsset);
                                    }
                
                                    if (!_.isNil(tickerDataAsset)) {
                                        var price_in_usdt = item.price_symbol_unit == "usdt" ? tickerDataAsset.currentClose : tickerDataAsset.currentClose * tickerDataBTC.currentClose;
                                        var object = {
                                            asset: item.asset,
                                            price_in_usdt: price_in_usdt.toString(),
                                            buy_in_rial: '',
                                            sell_in_rial: '',
                                            status: '',
                                            change_percent: tickerDataAsset.priceChangePercent
                                        }
                                        livePriceOutput.push(object);
                                    }
                
                                }); */
            });
        });
    }

    getAssetsInfo() {
        return [
            {
                "asset": "BTC",
                "price_symbol": "BTCUSDT",
                "price_symbol_unit": "USDT",
            },
            {
                "asset": "BNB",
                "price_symbol": "BNBUSDT",
                "price_symbol_unit": "USDT"
            },
            {
                "asset": "TRX",
                "price_symbol": "TRXBTC",
                "price_symbol_unit": "BTC"
            },
            {
                "asset": "XRP",
                "price_symbol": "XRPBTC",
                "price_symbol_unit": "BTC"
            },
            {
                "asset": "LTC",
                "price_symbol": "LTCBTC",
                "price_symbol_unit": "BTC"
            }
        ];
    }

}

module.exports = BinanceEx;