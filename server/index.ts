import { dbSqlite } from '../database/sqlite';
import 'dotenv/config'
import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
const { Client } = require('whatsapp-web.js');
import { startDatabase, handleSymbolsMt5 } from '../services/metatrader';

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

        socket.onAnyOutgoing(() => {
            //console.log('Algum Evento acounteceu')
        })

    });

    global.Whatsapp = client

    app.all('*', (req: any, res: any) => nextHandler(req, res));

    server.listen(port, async () => {
        await startDatabase()
        handleSymbolsMt5()
        console.log(`> Ready on http://localhost:${port}`)
    });
});
