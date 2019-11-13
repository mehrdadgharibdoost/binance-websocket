const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const BinanceApi = require("./modules/binance/lib/binance");
const _ = require('lodash');
const Exchange = require("./modules/Exchange");
const BinanceEx = require("./modules/BinanceEx");

var binanceEx = new BinanceEx;
var result = binanceEx.socketCoinsLivePrices();

/* io.of("/live-price").on("connection", (socket) => {
    binanceWS.onAllTickers((data) => {
        io.of("/live-price").emit('tickerUpdate', data);

        var results = _.filter(data, function (item) {
            return item.VAL.indexOf("BTC") > -1 || item.VAL.indexOf("USDT") > -1;
        });

        console.log(results);
    });
}); */

http.listen(port, () => {
    console.log("Server is listening on 127.0.0.1:" + port);
});