import openSocket from "socket.io-client";
const socket = openSocket("http://127.0.0.1:9000/live-price");
function subscribeToTimer(cb) {
  socket.on("timer", timestamp => cb(null, timestamp));
  socket.emit("subscribeToTimer", 1000);
}
export { subscribeToTimer };
