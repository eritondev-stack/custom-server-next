// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   if(req.method === "POST"){
     global.SocketServer.emit("MT5", req.body)
    try{
        
      res.status(200).json('eriton')

    }catch(e){
      res.status(401).json({
        error: 'error'
      })
    }
   }else{
    res.status(401).json({
      error: 'error'
    })
   }
    
        
}
