// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") res.status(405).json({ message: "Method not allowed" });

    const { fileName, repoOwner, repoName, filePath, branch } = req.body;
    try {

        const { data } = await axios.post(`https://my-express-app-f7i6.onrender.com/create-contract`, {
            repoOwner,
            repoName,
            branch,
            filePath,
            fileName
        })
        console.log(data, "data in create-contract");
        res.status(200).json({ data: data });
    } catch (error: any) {
        console.error(error.message, "error in create-contract");
        res.status(500).json({ message: error.message });
    }
}
