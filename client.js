import React from "react";
import ReactDOM from "react-dom";
const io = require("socket.io-client");
// let socketTest = io.connect("http://127.0.0.1:9000/live-price");
// socketTest.on("tickerUpdate", data => {
//   console.log(data);
// });

const App = props => {
  const [data, setData] = React.useState(null);
  const socketTest = io.connect("http://127.0.0.1:9000/live-price");
  React.useEffect(() => {
    socketTest.on("tickerUpdate", data => {
      setData(data);
    });
  }, []);
  return (
    <div>
      {data &&
        data.map((x, i) => {
          <div key={i}>
            <span>{x.asset}</span> : <span>{x.price_in_usdt}</span>
          </div>;
        })}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
