import React, { useEffect, useState } from "react";
import backgroud from "../../assets/img/background.svg";
import Card from './card'
import socketIOClient, { Socket } from "socket.io-client";


var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
  transports: ["websocket"]
});



const dashboard: React.FC = () => {
  
  const [ctrader, setCTrader] = useState<
  {
    symbol: string;
    price: number;
    digits: number;
    description: string;
    img_first: string
    img_second: string
  }[]
>([]);

useEffect(() => {

  socketGlobal.on("CTRADER", (data) => {
    
    setCTrader(data);
  });
}, []);


  return (
    <>
      <div
        style={{
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url(${backgroud.src})`,
        }}
        className="h-screen w-scree p-5 overflow-hidden"
      >
        <nav className="flex h-12 rounded-md backdrop-blur-sm bg-white/30">
          <div>Opa</div>
        </nav>
        <div className="flex flex-row h-full">
        <div className="rounded-md w-24 backdrop-blur-sm bg-white/30 mt-2">

        </div>
        <div style={{
          maxHeight: "1000px"
        }} className="rounded-md flex-1 backdrop-blur-sm bg-white/30 ml-2 mt-2 p-5 overflow-y-auto">
          <div className="grid xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {ctrader.map((item) => {
          return <Card img_second={item.img_second} img_first={item.img_first} price={item.price.toFixed(item.digits)} symbol={item.symbol} description={item.description} />
        })}
          </div>
       
        </div>
        </div>
      </div>
    </>
  );
};

export default dashboard;
