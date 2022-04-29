import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import QRCode from "react-qr-code";
import { getAuth } from "firebase/auth";
import { app } from "../services/firebase-app";

const auth = getAuth(app);

var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
  transports: ["websocket"],
});

function App() {
  const [qr, setQr] = useState("");

  const [ctrader, setCTrader] = useState<
    {
      symbol: string;
      price: number;
      digits: number;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    socketGlobal.on("QR", (data) => {
      setQr(data);
    });

    socketGlobal.on("CTRADER", (data) => {
      
      setCTrader(data);
    });
  }, []);

  return (
    <>
      <div>Total de pares CTrader: {ctrader.length}</div>
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
      <div className="flex flex-row ml-5">
        <div>
          <table>
            <tbody>
              {ctrader.map((item) => {
                return (
                  <div>
                   Teste: {item.symbol}: {Number(item.price).toFixed(item.digits)} | digits: {item.digits} | name: {item.description}
                  </div>
                );
              })}
            </tbody>
          </table>
        </div>

        <div></div>
      </div>

      <button
        className="my-4"
        onClick={async () => {
          console.log(auth.currentUser);
          auth.signOut();
        }}
      >
        Logout
      </button>
    </>
  );
}

export default App;
