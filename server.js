const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const BinanceApi = require("./modules/binance/lib/binance");
const _ = require('lodash');
const Exchange = require("./modules/Exchange");
const BinanceEx = require("./modules/BinanceEx");

var exchange = new Exchange(new BinanceEx);
exchange.socketCoinsLivePrices(9000, 'live-price');