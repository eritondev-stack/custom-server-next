import React from "react";

// import { Container } from './styles';
interface ICard {
    symbol: string;
    description: string;
    price: string;
    img_first: string
    img_second: string
}


//const dashboard: React.FC = () => {


const card: React.FC<ICard> =( { symbol, description, price, img_first, img_second }: ICard) => {
  return (
    <div className="h-32 bg-white rounded-md m-2">
      <div className="flex flex-row items-center w-72 h-32">
        <div className="relative w-28 h-16 ml-2">
          <div
            style={{
              backgroundSize: "cover",
              backgroundImage: `url(${img_first})`,
            }}
            className="rounded-full bg-gray-100 w-12 h-12 absolute z-10"
          ></div>
          <div
            style={{
              right: "-15px",
              backgroundSize: "cover",
              backgroundImage: `url(${img_second})`,
            }}
            className="rounded-full bg-gray-200 w-12 h-12 absolute"
          ></div>
        </div>

        <div className="ml-8 flex flex-col">
          <div className="text-xl font-bold">{symbol}</div>
          <div className="text-sm text-gray-500">
            {description}
          </div>
        </div>

        <div className="ml-8 flex flex-col">
          <div className="text-xl font-bold">desc: {price}</div>
        </div>
      </div>
    </div>
  );
};

export default card;
