// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") res.status(405).json({ message: "Method not allowed" });

    const { repoOwner, repoName, filePath, branch } = req.body;
    console.log(req.body, "req.body in create-contract");
    try {

        const res1 = await axios.post(`https://my-express-app-f7i6.onrender.com/get-contract`, {
            repoOwner,
            repoName,
            filePath,
            branch
        })

        res.status(200).json({ code: res1.data });
    } catch (error: any) {
        console.error(error.message, "error in get-contract");
        res.status(500).json({ message: error.message });
    }
}
