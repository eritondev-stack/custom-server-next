import { Mida, MidaBroker, MidaBrokerAccount, MidaMarketWatcher, MidaTimeframe } from "@reiryoku/mida"
import { IAlerts } from "model";
import { db } from '../database/index'
import { getPairs } from "./firebase-database";



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


async function insertImgBanco() {
    try {
        if (true) {
            const imgsFireBase = await getPairs()
            for (const item of imgsFireBase) {
                await db<IAllPairs>('PAIRS').update({
                    img_first: item.img_first,
                    img_second: item.img_second
                }).where({
                    symbol: item.symbol
                })
                console.log(item)
            }
        }

    } catch (err) {
        console.log(err)
    }
}

async function initBanco() {
    try {
        const bdSelect = await db<IAllPairs>('TB_SYMBOLS').select("*")
        for (const item of bdSelect) {
            allPairs.push(item)
        }
        global.SocketServer.emit('CTRADER', allPairs)
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


async function loginAccount() {
    if (global.CtraderAccount === undefined) {
        const myAccount = await MidaBroker.login("cTrader", access);
        global.CtraderAccount = myAccount
    }
}

async function getSymbolsErrors(): Promise<string[]> {
    await loginAccount()
    let symbolsRemoved: string[] = []
    const symbols: string[] = await global.CtraderAccount.getSymbols()
    for (let index = 0; index < symbols.length; index++) {
        const pair = symbols[index];
        try {

            const periods = await global.CtraderAccount.getSymbolPeriods(pair, MidaTimeframe.M30);
            const lastPeriod = periods[periods.length - 1];
            lastPeriod.close
        } catch (e) {
            console.log("Remover: " + pair)
            symbolsRemoved.push(pair)
        }
    }

    return symbolsRemoved
}

async function getSymbolsCtrader() {
    await loginAccount()

    const symbolsAvalible: string[] = await global.CtraderAccount.getSymbols()
    const symbolsRemove: string[] = await getSymbolsErrors()
    const symbols: string[] = symbolsAvalible.filter((item) => symbolsRemove.filter((item2) => item === item2).length === 0)
    for (let index = 0; index < symbols.length; index++) {
        const pair = symbols[index];

        try {
            const s = await global.CtraderAccount.getSymbol(pair)
            const price = await global.CtraderAccount.getSymbolBid(pair)
            console.log(pair + ": " + price)
            const isExist = allPairs.filter(item => item.symbol === pair).length > 0
            if (isExist) {
                //console.log('Ja existe por favor atualizar')
                const objIndex = allPairs.findIndex((obj => obj.symbol === pair));
                allPairs[objIndex].price = price
            } else {
                allPairs.push({
                    symbol: pair,
                    price: price,
                    digits: s.digits,
                    description: s.description
                })
            }

        } catch (e) {
            console.log("error: " + pair)
        }
    }
}

async function handleSymbols() {
    await loginAccount()
    const symbolsAvalible: string[] = await global.CtraderAccount.getSymbols()
    const symbolsRemove: string[] = await getSymbolsErrors()
    const symbols: string[] = symbolsAvalible.filter((item) => symbolsRemove.filter((item2) => item === item2).length === 0)
    for (let index = 0; index < symbols.length; index++) {
        const pair = symbols[index];
        await startOnSymbols(pair, global.CtraderAccount)
    }
}


async function startOnSymbols(symbol: any, myAccount: MidaBrokerAccount) {

    const marketWatcher = new MidaMarketWatcher({ brokerAccount: myAccount });
    try {
        await marketWatcher.watch(symbol, { watchTicks: true, });

        marketWatcher.on("tick", (event: any) => {
            const { tick, } = event.descriptor;
            const isExist = allPairs.filter(item => item.symbol === symbol).length > 0
            if (isExist) {
                //console.log('Ja existe por favor atualizar')
                const objIndex = allPairs.findIndex((obj => obj.symbol === symbol));
                allPairs[objIndex].price = Number(tick.bid)

            } /* else {
                allPairs.push({
                    symbol: symbol,
                    price: Number(tick.bid)
                })
            } */
            //console.log(symbol + ': ' + tick.bid);
            global.SocketServer.emit('CTRADER', allPairs)
        });
    } catch (e) {
        console.log(e)
    }
}

async function observableAlert() {
    setInterval(async () => {
        const alerts = await db<IAlerts>('TB_SCHEDULE_ALERTS').select("*").where({ active: true })
        for (const item of alerts) {
            console.log(item)
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
        if (alert.price >= currentPrice) {
            await Whatsapp.sendMessage('5511960655281@c.us', `${symbol} - ${message}`)
            await db("TB_SCHEDULE_ALERTS").update({
                active: false
            }).where({
                id: alert.id
            })
        }
    } else if (direction === "down") {
        if (alert.price <= currentPrice) {
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

export { handleSymbols, getSymbolsCtrader, initBanco, backupBanco, insertImgBanco, observableAlert }
