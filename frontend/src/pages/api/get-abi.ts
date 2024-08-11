// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") res.status(405).json({ message: "Method not allowed" });

    const { contractName } = req.body;

    try {
        const { data } = await axios.post(`https://my-express-app-f7i6.onrender.com/get-abi`, {
            contractName
        })
        console.log(data, "data in get-abi");
        res.status(200).json({ abi: data.abi });
    } catch (error: any) {
        console.error(error.message, "error in get-abi");
        res.status(500).json({ message: error.message });
    }
}
