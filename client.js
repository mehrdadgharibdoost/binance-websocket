import React from "react";
import ReactDOM from "react-dom";
import openSocket from "socket.io-client";
const socketTest = openSocket("http://127.0.0.1:9000/live-price");

const App = props => {
  const [data, setData] = React.useState(null);
  const [status, setStatus] = React.useState();

  React.useEffect(() => {
    socketTest.on("tickerUpdate", data => {
      setData(data);
    });
  }, [data]);

  React.useEffect(() => {
    socketTest.on("connect", () => {
      setStatus("online");
    });
    socketTest.on("disconnect", reason => {
      setStatus(`disconnect ${reason}`);
    });
  });

  return (
    <div>
      <h1>
        COIN <span style={{ fontSize: "50%" }}>{status}</span>
      </h1>
      {data &&
        data.map((x, i) => (
          <div key={i}>
            <span>{x.asset}</span> : <span>{x.price_in_usdt} (USDT)</span>
          </div>
        ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
