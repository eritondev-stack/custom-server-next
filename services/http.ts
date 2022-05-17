import axios from 'axios'

const http = axios.create({
    baseURL: process.env.ENDPOINT,
    headers: {
        'Content-Type': 'application/json',
    }  
})

const insertAlert = async (_data: any) => {
    const resp = await http.post("/api/alert", {
        email: "delma@gmail.com",
        price: 50.568704,
        direction: "up",
        message: "Opa meu amigo",
        phone_number: "+5511960655281",
        symbol: "AUDCAD",      
    })
    return resp
}

export { insertAlert }