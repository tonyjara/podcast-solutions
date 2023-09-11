import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate"
import { validatePodcastEdit } from "@/components/Validations/PodcastEdit.validate"
import "fast-text-encoding"
import { createId } from "@paralleldrive/cuid2"
import { AudioFile, Episode, Podcast } from "@prisma/client"
import Parser from "rss-parser"
import slugify from "slugify"
import { validateAudioFile } from "@/components/Validations/Validate.AudioFile"

export type PodcastParserFeed = {
    [key: string]: any
} & Parser.Output<{
    [key: string]: any
}>

export const parsePodcastFromFeed = ({
    feed,
    email,
    subscriptionId,
}: {
    feed: PodcastParserFeed
    email: string
    subscriptionId: string
}): Podcast => {
    const podcastId = createId()

    const podcastFromFeed: Podcast = {
        id: podcastId,
        active: true,
        podcastStatus: "unpublished",
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriptionId: subscriptionId,
        publishedAt: feed.pubData ? new Date(feed.pubDate) : new Date(),
        name: feed.title ?? "",
        email: feed.itunes?.owner?.email ?? email,
        author: feed.itunes?.author ?? feed.title ?? "",
        slug: slugify(feed.title ?? "", { lower: true }),
        description: feed.description?.length
            ? feed.description
            : feed.title ?? "",
        categories: feed.itunes?.categories ?? ["Courses"],
        language: feed.language ?? "",
        imageUrl:
            feed.itunes?.image ??
            "https://res.cloudinary.com/tonyjara/image/upload/v1693264443/podcast-solutions/on2i87kict0sy7tictyl.jpg",
        explicit: feed.itunes?.explicit === "true" ? true : false,
        type: feed.itunes?.type ?? "episodic",
    }

    validatePodcastEdit.parse(podcastFromFeed)

    return podcastFromFeed
}

export const parseEpisodesAndAudioFilesFromFeed = ({
    feed,
    podcastId,
    subscriptionId,
}: {
    feed: PodcastParserFeed
    podcastId: string
    subscriptionId: string
}): { episodes: Episode[]; audioFiles: AudioFile[] } => {
    let episodes: Episode[] = []

    let audioFiles: AudioFile[] = []

    feed.items?.forEach((item, index) => {
        const episodeId = createId()
        const audioFileId = createId()
        const podcastEpisode: Episode = {
            id: episodeId,
            createdAt: new Date(),
            keywords: item.itunes?.keywords ?? "",
            subscriptionId: subscriptionId,
            updatedAt: new Date(),
            releaseDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            title: item.title ?? "",
            showNotes: item.content ?? "",
            transcription: "",
            imageUrl: item.itunes?.image ?? "",
            explicit: item.itunes?.explicit === "true" ? true : false,
            status: "published",
            seasonNumber: item.itunes?.season
                ? parseInt(item.itunes.season)
                : 1,
            episodeNumber: item.itunes?.episode
                ? parseInt(item.itunes.episode)
                : index + 1,
            episodeType: item.itunes?.episodeType ?? "full",
            podcastId: podcastId,
            selectedAudioFileId: audioFileId,
        }

        const handleParseInt = (x: unknown) => {
            if (typeof x === "string") {
                return parseInt(x)
            }
            if (typeof x === "number") {
                return x
            }
            return 0
        }

        const handleDuration = (x: unknown) => {
            // Some podcasts have their duration in hours minutes and seconds, others in hours and minutes
            //If it's a string with semi-colons, parse it, else return as is
            if (typeof x === "string") {
                if (x.includes(":")) {
                    if (x.split(":").length === 3) {
                        const [hours, minutes, seconds] = x.split(":")
                        return (
                            parseInt(hours ?? "0") * 60 * 60 +
                            parseInt(minutes ?? "0") * 60 +
                            parseInt(seconds ?? "0")
                        )
                    }
                    if (x.split(":").length === 2) {
                        const [minutes, seconds] = x.split(":")
                        return (
                            parseInt(minutes ?? "0") * 60 +
                            parseInt(seconds ?? "0")
                        )
                    }
                }
                return parseInt(x)
            }
            if (typeof x === "number") {
                return x
            }
            return 0
        }

        const episodeAudioFile: AudioFile = {
            id: audioFileId,
            createdAt: new Date(),
            updatedAt: new Date(),
            subscriptionId: subscriptionId,
            name: item.name ?? `audio-file-episode-${index + 1}`,
            length: handleParseInt(item.enclosure?.length),
            duration: handleDuration(item.itunes?.duration),
            url: item.enclosure?.url ?? "",
            podcastId: podcastId,
            episodeId: episodeId,
            type: "audio/mpeg",
            blobName: audioFileId,
            isHostedByPS: false,
            isSelected: true,
        }
        const isValidEpisode = validateEpisodeEdit.safeParse(podcastEpisode)
        const isValidAudioFile = validateAudioFile.safeParse(episodeAudioFile)

        if (isValidEpisode.success && isValidAudioFile.success) {
            episodes.push(podcastEpisode)
            audioFiles.push(episodeAudioFile)
        }
        //TODO add error handling when validation fails
    })

    return { episodes, audioFiles }
}
