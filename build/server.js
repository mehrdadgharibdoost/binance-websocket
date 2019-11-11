"use strict";
var express = require("express");
var app = express();
var port = 3000;
var http = require("http").createServer();
var io = require("socket.io")(http);
var api = require("binance");
var _ = require('lodash');
var binanceWS = new api.BinanceWS(true);
var tickerDataHistoryAsset = [];
binanceWS.onAllTickers(function (tickerData) {
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
    }
    else {
        tickerDataHistoryAsset['btc'] = [];
        tickerDataHistoryAsset['btc'].push(tickerDataBTC, tickerDataBTC);
    }
    console.log(tickerDataHistoryAsset);
    livePriceAssetsInfo.forEach(function (item) {
        var tickerDataAsset = _.find(tickerData, function (tickerDataItem) {
            return item.price_symbol.toUpperCase() == tickerDataItem.symbol;
        });
        if (_.isNil(tickerDataAsset)) {
            tickerDataAsset = tickerDataHistoryAsset[item.asset][1];
        }
        if (!_.isNil(tickerDataHistoryAsset[item.asset]) && tickerDataHistoryAsset[item.asset].length >= 2) {
            tickerDataHistoryAsset[item.asset].shift();
            tickerDataHistoryAsset[item.asset].push(tickerDataAsset);
        }
        else {
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
            };
            livePriceOutput.push(object);
        }
    });
    // console.log(livePriceOutput);
});
/* binanceWS.onTicker("BTCUSDT", (data) => {
    console.log(data.currentClose);
}); */
var initializeCoinPrices;
io.of("/live-price").on("connection", function (socket) {
    binanceWS.onAllTickers(function (data) {
        io.of("/live-price").emit('tickerUpdate', data);
        var results = _.filter(data, function (item) {
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
http.listen(port, function () {
    console.log("Server is listening on 127.0.0.1:" + port);
});
