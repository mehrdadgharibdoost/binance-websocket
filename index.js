const api = require("binance");
const binanceWS = new api.BinanceWS(true);

binanceWS.onAllTickers((data) => {
    console.log(data);
});

binanceWS.onDepthUpdate('BNBBTC', (data) => {
    console.log(data);
});