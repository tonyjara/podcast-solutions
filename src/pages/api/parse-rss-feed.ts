import { getServerAuthSession } from "@/server/auth"
import type { NextApiRequest, NextApiResponse } from "next"
import Parser from "rss-parser"

export default async function getSasToken(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerAuthSession({ req, res })

    if (!session) {
        return res.status(401).json({ error: "unauthorized" })
    }

    const parser = new Parser()
    const feed = await parser.parseURL(req.body.rssFeedUrl)
    res.status(200).json({ feed })
}
