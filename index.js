const api = require("binance");
const binanceWS = new api.BinanceWS(true);

binanceWS.onDepthUpdate('BNBBTC', (data) => {
    console.log(data);
});