import axios from 'axios';

const http = axios.create({
    baseURL: process.env.ENDPOINT,
  });


const getSymbols = async () => {
const data = await http.get("/api/symbols")
return data.data
}
const getAlerts = async () => {
  const data = await http.get("/api/alerts")
  return data.data
  }

export { getSymbols  }