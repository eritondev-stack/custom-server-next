import { IAlerts, ISymbols } from "model";
import { db } from '../database/index'
import socketIOClient, { Socket } from "socket.io-client";
import { ListItem } from "@mui/material";



var socketGlobal: Socket = socketIOClient(process.env.ENDPOINT as string, {
    transports: ["websocket"],
});


var allPairs: {
    symbol: string;
    price: number;
    digits?: number;
    description?: string;
    img_first?: string
    img_second?: string
}[] = []

interface IAllPairs {
    symbol: string;
    price: number;
    digits?: number;
    description?: string;
    img_first?: string
    img_second?: string
}[]



const handleSymbolsMt5 = () => {
    socketGlobal.on('MT5_SOCKET', (data: { symbol: string; price: number; digits: number }[]) => {
        try {

            data.forEach(fe => {
                const { price, symbol } = fe
                global.SocketServer.emit(symbol, {
                    ...allPairs.filter((el) => el.symbol === symbol )[0],  
                    price: price,                   
                }) 
            });

        
        } catch (error) {

    }

})
}

async function initBanco() {
    try {
        const bdSelect = await db<IAllPairs>('TB_SYMBOLS').select("*")
        for (const item of bdSelect) {
            allPairs.push(item)
        }
        global.SocketServer.emit('ON_MT5', allPairs)
    } catch (err) {
        console.log(err)
    }
}

async function backupBanco() {
    console.log('Backup Banco de dados')
    try {
        if (true) {
            for (const item of allPairs) {
                await db<IAllPairs>('TB_SYMBOLS').update({
                    price: item.price,
                }).where({
                    symbol: item.symbol
                })
            }
        }

    } catch (err) {
        console.log(err)
    }
}


async function observableAlert() {

    setInterval(async () => {
        const alerts = await db<IAlerts>('TB_SCHEDULE_ALERTS').select("*").where({ active: true })
        for (const item of alerts) {
            const { price, symbol } = getCurrentPair(item.symbol)
            await triggerAlert(symbol, item.message, item.direction, price, item)
        }
    }, 1000)
}

function getCurrentPair(symbol: string) {
    const alerts = allPairs.filter((item) => item.symbol === symbol)[0]
    return alerts
}

async function triggerAlert(symbol: string, message: string, direction: string, currentPrice: number, alert: IAlerts) {

    if (direction === "up") {
        if (currentPrice >= alert.price) {
            await Whatsapp.sendMessage('5511960655281@c.us', `${symbol} - ${message}`)
            await db("TB_SCHEDULE_ALERTS").update({
                active: false
            }).where({
                id: alert.id
            })
        }
    } else if (direction === "down") {
        if (currentPrice <= alert.price) {
            await Whatsapp.sendMessage('5511960655281@c.us', `${symbol} - ${message}`)
            await db("TB_SCHEDULE_ALERTS").update({
                active: false
            }).where({
                id: alert.id
            })
        }
    } else {

    }
}

async function later(delay: number): Promise<void> {
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}

export { initBanco, backupBanco, observableAlert, handleSymbolsMt5 }
