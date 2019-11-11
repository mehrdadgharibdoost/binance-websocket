const Exchange = require("./modules/Exchange");
const Binance = require("./modules/Binance");

var exchage = new Exchange(new Binance);


console.log(exchage);