import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import QRCode from "react-qr-code";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from '../services/firebase-app'

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
  transports: ["websocket"],
});


function App() {
  const [qr, setQr] = useState("");
  const [pairs, setPairs] = useState<
    {
      symbol: string;
      price: number;
    }[]
  >([]);

  


  useEffect(() => {
    socketGlobal.on("QR", (data) => {
      setQr(data);
    });

/*    socketGlobal.on("CTRADER", (data) => {
      setPairs(data);
    });
 */
    socketGlobal.on("MT5", (data) => {
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
            return (
              <div>
                {item.symbol}: {item.price}
              </div>
            );
          })}
        </tbody>
      </table>
      <button
          className="my-4"
          onClick={async () => {
            signInWithPopup(auth, provider)
            .then((result) => {
              // This gives you a Google Access Token. You can use it to access the Google API.
              const credential = GoogleAuthProvider.credentialFromResult(result);
              const token = credential?.accessToken;
              // The signed-in user info.
              const user = result.user;
              console.log(user)
              // ...
            }).catch((error) => {
              // Handle Errors here.
              const errorCode = error.code;
              const errorMessage = error.message;
              // The email of the user's account used.
              const email = error.email;
              // The AuthCredential type that was used.
              const credential = GoogleAuthProvider.credentialFromError(error);
              // ...
            });
          }}
        >
          Login Gmail
        </button>

        <button
          className="my-4"
          onClick={async () => {
           auth.signOut()
          }}
        >
          Logout
        </button>
        
    </>
  );
}

export default App;