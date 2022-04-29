// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getPairs } from 'services/firebase-database'
import { db } from '../../../database/index'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   if(req.method === "GET"){

    try{      
        const bdSelect = await await db('TB_SYMBOLS').select("*")
        console.log(bdSelect)
        res.status(200).json(bdSelect)

    }catch(e){
    
      res.status(401).json({
        error: e
      })
    }
   }else{
    res.status(401).json({
      error: 'error'
    })
   }
    
        
}
