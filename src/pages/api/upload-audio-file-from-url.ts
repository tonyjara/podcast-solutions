import { getServerAuthSession } from "@/server/auth"
import { AS } from "@/server/azure/blob-storage"
import { prisma } from "@/server/db"
import { createServerLog } from "@/server/serverUtils"
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob"
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import slugify from "slugify"

/** 
Stream audio file from url to Azure Blob storage-blob
Create new audio file in DB 
Delete old audio file from DB
*/
export default async function uploadAudioFileFromUrl(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        //Guards
        if (req.method !== "POST") {
            return res.status(405).json({ error: "method not allowed" })
        }
        const session = await getServerAuthSession({ req, res })
        if (!session) {
            return res.status(401).json({ error: "unauthorized" })
        }
        const audioFile = await prisma.audioFile.findUniqueOrThrow({
            where: { id: req.body.audioFileId, isHostedByPS: false },
        })

        //Upload audio file to Azure Blob Storage
        const sasToken = AS.createConnectionString()
        const audioNameSlug = `${slugify(
            `${audioFile.episodeId}-${audioFile.name}-audio-file`,
            {
                lower: true,
            }
        )}.mp3`

        const blobService = new BlobServiceClient(sasToken)
        blobService.setProperties({
            cors: [
                {
                    allowedOrigins: "*",
                    allowedMethods: "PUT,GET",
                    allowedHeaders: "*",
                    exposedHeaders: "*",
                    maxAgeInSeconds: 60,
                },
            ],
        })
        const containerClient: ContainerClient = blobService.getContainerClient(
            session.user.id
        )
        await containerClient.createIfNotExists({
            access: "container",
        })
        const blobClient = containerClient.getBlockBlobClient(audioNameSlug)

        /* NOTE: I've failed misserably trying to extract peaks from audio file, so far I've used node-lame and waveform-data, doing this from the client is hard because some url's don't allow get from the browser  */

        /* INFO: upload */

        const getStream = await axios.get(audioFile.url, {
            responseType: "stream",
        })
        const stream = getStream.data
        await blobClient.uploadStream(stream, stream.byteLength, 4, {
            blobHTTPHeaders: {
                blobContentType: "audio/mpeg", // mp3
            },
        })

        //Create new audio file in DB
        await prisma.audioFile.create({
            data: {
                name: audioFile.name,
                blobName: audioNameSlug,
                url: blobClient.url,
                episodeId: audioFile.episodeId,
                isHostedByPS: true,
                podcastId: audioFile.podcastId,
                subscriptionId: audioFile.subscriptionId,
                length: audioFile.length,
                duration: audioFile.duration,
                type: audioFile.type,
                isSelected: audioFile.isSelected,
                peaks: audioFile.peaks.length > 0 ? audioFile.peaks : [],
            },
        })
        //Delete old audio file from DB
        await prisma.audioFile.delete({
            where: { id: audioFile.id },
        })

        res.status(200).json({ status: "success", error: null })
    } catch (error) {
        console.error(error)
        createServerLog("Error uploading audio file from url", "error")
        res.status(500).json({ status: "error", error: JSON.stringify(error) })
    }
}
