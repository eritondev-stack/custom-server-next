import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import QRCode from "react-qr-code";


var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
  transports: ["websocket"],
});

console.log(process.env)


function App() {
  const [qr, setQr] = useState("");
  const [pairs, setParis] = useState<any>({});

  useEffect(() => {
    socketGlobal.on("QR", (data) => {
      setQr(data);
    });

    socketGlobal.on("CTRADER", (data) => {
      console.log(pairs)
      setParis(data);
    });

  }, []);

  return (
    <>
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
    </>
  );
}

export default App;
