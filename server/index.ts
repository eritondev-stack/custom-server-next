import 'dotenv/config'
import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import { loginFirebase } from '../services/firebase-login';
import * as socketio from 'socket.io';
const { Client } = require('whatsapp-web.js');


const client = new Client({
    puppeteer: {
        args: ['--no-sandbox']
    }
});

declare global {
    // eslint-disable-next-line no-var
    var SocketServer: socketio.Server;
    // eslint-disable-next-line no-var
    var Whatsapp: any;
    var CtraderAccount: any
}


client.on('qr', (qr: string) => {
    // Generate and scan this code with your phone
    global.SocketServer.emit('QR', qr)
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg: any) => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }

    if (msg.body == 'start server') {
        msg.reply('servidor dos pares iniciado');
    }
});


const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
    const app: Express = express();
    const server: http.Server = http.createServer(app);
    const io: socketio.Server = new socketio.Server();
    io.attach(server, {
        transports: ['websocket'],
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    global.SocketServer = io

    app.get('/hello', async (_: Request, res: Response) => {
        res.send('Hello World')
    });

    io.on('connection', (socket: socketio.Socket) => {
        console.log('connection');
        socket.emit('status', 'Hello from Socket.io');

        socket.on('disconnect', () => {
            console.log('client disconnected');
        })

        socket.on('ww', () => {
            client.initialize();
        })

    });

    global.Whatsapp = client

    app.all('*', (req: any, res: any) => nextHandler(req, res));

    server.listen(port, async () => {
        console.log(`> Ready on http://localhost:${port}`);     
        //await loginAccount()   
        await loginFirebase()
    });
});



/* import { Mida, MidaBroker, MidaBrokerAccount, MidaMarketWatcher } from "@reiryoku/mida"
Mida.use(require("@reiryoku/mida-ctrader"));

const access = {
    clientId: "3369_kGf0PTNhOrFR3myRVJ3U4vcNXsXPv6dKljqstauXfkxYabyvbd",
    clientSecret: "pH80pT5BQhedjuXU7KJmwd4nsIEXOHwE8QHdsJndE9RFEgxl4f",
    accessToken: "5r1BriH9jgSsYbcqQg3c-4WoYHP2bCbWGYIaBnxZlKA",
    cTraderBrokerAccountId: "23208463",
};

var allPairs: {
    symbol: string;
    price: number;
}[] = []

async function loginAccount() {
    if(global.CtraderAccount === undefined){
        const myAccount = await MidaBroker.login("cTrader", access);
        global.CtraderAccount = myAccount
    }
}

async function getAccount() {
    const myAccount = await MidaBroker.login("cTrader", access);
    const symbols = await myAccount.getSymbols()


    for (let index = 0; index < symbols.length; index++) {
        const pair = symbols[index];
        await whats(pair, myAccount)
    }
}


async function whats(symbol: any, myAccount: any) {

    const marketWatcher = new MidaMarketWatcher({ brokerAccount: myAccount, });
    try {
        await marketWatcher.watch(symbol, { watchTicks: true, });

        marketWatcher.on("tick", (event: any) => {
            const { tick, } = event.descriptor;
            const isExist = allPairs.filter(item => item.symbol === symbol).length > 0
            if(isExist){
                //console.log('Ja existe por favor atualizar')
                const objIndex = allPairs.findIndex((obj => obj.symbol === symbol));
                allPairs[objIndex].price = Number(tick.bid)         
            }else{
                allPairs.push({
                    symbol: symbol,
                    price: Number(tick.bid)              
                })
            }
            //console.log(symbol + ': ' + tick.bid);
            global.SocketServer.emit('CTRADER', allPairs)
        });
    } catch (e) {
        console.log(e)
    }

} */