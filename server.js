const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const api = require("binance");
const _ = require('lodash');

const binanceWS = new api.BinanceWS(true);

var tickerDataHistoryAsset = [];

binanceWS.onAllTickers((tickerData) => {
    /** result output */
    var livePriceOutput = [];

    /** get from DB */
    var livePriceAssetsInfo = [
        {
            "asset": "btc",
            "price_symbol": "btcusdt",
            "price_symbol_unit": "usdt"
        },
        {
            "asset": "bnb",
            "price_symbol": "bnbbtc",
            "price_symbol_unit": "btc"
        },
        {
            "asset": "trx",
            "price_symbol": "trxusdt",
            "price_symbol_unit": "usdt"
        },
        {
            "asset": "qkc",
            "price_symbol": "qkcbtc",
            "price_symbol_unit": "btc"
        }
    ];

    tickerDataBTC = _.find(tickerData, function (dataItem) {
        return "BTCUSDT" == dataItem.symbol;
    });

    if (_.isNil(tickerDataBTC)) {
        tickerDataBTC = tickerDataHistoryAsset['btc'][1];
    }

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

    });

    // console.log(livePriceOutput);


    /*
    // make array of markets for live price
     var livePriceAssetsInfoMarkets = livePriceAssetsInfo.map(function (item) { return item.price_symbol.toUpperCase(); });
    var livePriceAssets = livePriceAssetsInfo.map(function (item) { return item.asset.toUpperCase(); });

    // get only needed results from binance
    var results = _.filter(data, function (item) {
        if (livePriceAssetsInfoMarkets.includes(item.symbol)) {
            var livePriceAssetsInfoObj = livePriceAssetsInfo.find(obj => {
                objMarket = obj.price_symbol.toUpperCase();
                return objMarket === item.symbol;
            });
            item.asset = livePriceAssetsInfoObj.asset.toUpperCase();
            item.market_unit = livePriceAssetsInfoObj.price_symbol_unit.toUpperCase();
            return true;
        } else {
            return false;
        }
    });

    // make ready output
    var str = "";
    results.forEach(element => {
        str += `| ${element.asset} : ${element.currentClose} (${element.market_unit}) |`;
    });
    console.log(str); 
    */
});

/* binanceWS.onTicker("BTCUSDT", (data) => {
    console.log(data.currentClose);
}); */



io.of("/live-price").on("connection", (socket) => {

    binanceWS.onAllTickers((data) => {
        io.of("/live-price").emit('tickerUpdate', data);

        var results = _collection.filter(data, function (item) {
            return item.VAL.indexOf("BTC") > -1 || item.VAL.indexOf("USDT") > -1;
        });

        console.log(results);
    });

    /* socket.emit("welcome", "hello dear user ...");
    console.log("New Client is Connected ...");

    socket.on("joinRoom", (room) => {
        if (rooms.includes(room)) {
            socket.join(room);
            socket.emit("success", `you joins successfuly in room named: ${room}`);
            io.of("/test").in(room).emit('newUser', 'new user joined to the room named: ' + room);
        } else {
            socket.emit("err", `the room named '${room}' is not exists`);
        }

    }); */
});

http.listen(port, () => {
    console.log("Server is listening on 127.0.0.1:" + port);
});