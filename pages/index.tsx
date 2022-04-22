import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import QRCode from "react-qr-code";


var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
  transports: ["websocket"],
});

console.log(process.env)


function App() {
  const [qr, setQr] = useState("");
  const [pairs, setPairs] = useState<{
    symbol: string;
    price: number;
  }[]>([]);

  useEffect(() => {
    socketGlobal.on("QR", (data) => {
      setQr(data);
    });

    socketGlobal.on("CTRADER", (data) => {
      setPairs(data);
    });

  }, []);

  return (
    <>
    <div>Total de pares: {pairs.length}</div>
    <div className="p-12">
      
<QRCode value={qr} />
   
      <button
        className="my-4"
        onClick={() => {
          socketGlobal.emit("ww", "");
          setQr("");
        }}
      >
        Acessar whatsapp
      </button>
    </div>
    <table>
      <tbody>
       {pairs.map((item) => {
         return <div>{item.symbol}: {item.price}</div>
       })}
      </tbody>
    </table>
    </>
  );
}

export default App;
