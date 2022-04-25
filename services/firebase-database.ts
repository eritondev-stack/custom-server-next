
import { collection, getDocs, getFirestore } from '@firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { app } from './firebase-app';
const auth = getAuth(app)
const db = getFirestore(app);


async function getPairs() {


    try {

        const login = await signInWithEmailAndPassword(auth, 'eriton.gomes.souza@outlook.com', 'E#@8712d')
        console.log(login.user.uid)

        const querySnapshot = await getDocs(collection(db, "symbols"));


     let data: any[] = []

        querySnapshot.forEach((item) => {
            (item.data().pairs as Array<any>).forEach((item2) => {
                data.push(item2)
            })
        })  
    
        return data

    } catch (error: any) {
        throw new Error(error.message)
    }
}

export { getPairs }


