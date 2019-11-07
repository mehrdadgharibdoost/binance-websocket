const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const api = require("binance");

const binanceWS = new api.BinanceWS(true);

/* binanceWS.onAllTickers((data) => {
    console.log(data.length);
    // io.of("/live-price").emit('tickerUpdate', data['symbol']);
}); */

io.of("/live-price").on("connection", (socket) => {

    binanceWS.onAllTickers((data) => {
        //console.log(data.length);
        io.of("/live-price").emit('tickerUpdate', data);
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