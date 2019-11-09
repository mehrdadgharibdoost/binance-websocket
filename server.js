const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const api = require("binance");
const _array = require('lodash/array');
const _collection = require('lodash/collection');

const binanceWS = new api.BinanceWS(true);

binanceWS.onAllTickers((data) => {
    /** get from DB */
    var livePriceAssetsInfo = [
        {
            "asset": "btc",
            "market": "btcusdt",
            "market_unit": "usdt"
        },
        {
            "asset": "bnb",
            "market": "bnbbtc",
            "market_unit": "btc"
        },
        {
            "asset": "qkc",
            "market": "qkcbtc",
            "market_unit": "btc"
        }
    ];

    // make array of markets for live price
    var livePriceAssetsInfoMarkets = livePriceAssetsInfo.map(function (el) { return el.market.toUpperCase(); });

    // get only needed results from binance
    var results = _collection.filter(data, function (item) {
        if (livePriceAssetsInfoMarkets.includes(item.symbol)) {
            var livePriceAssetsInfoObj = livePriceAssetsInfo.find(obj => {
                objMarket = obj.market.toUpperCase();
                return objMarket === item.symbol;
            });
            item.asset = livePriceAssetsInfoObj.asset.toUpperCase();
            item.market_unit = livePriceAssetsInfoObj.market_unit.toUpperCase();
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