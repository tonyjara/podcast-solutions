import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate"
import { validatePodcastEdit } from "@/components/Validations/PodcastEdit.validate"
import "fast-text-encoding"
import { createId } from "@paralleldrive/cuid2"
import { AudioFile, Episode, Podcast } from "@prisma/client"
import Parser from "rss-parser"
import slugify from "slugify"
import { validateAudioFile } from "@/components/Validations/Validate.AudioFile"
import { parseDurationToSeconds } from "@/lib/utils/durationUtils"

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

    const sortedFeedItems = feed.items?.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate) : new Date()
        const dateB = b.pubDate ? new Date(b.pubDate) : new Date()
        return dateA.getTime() - dateB.getTime()
    })

    sortedFeedItems?.forEach((item, index) => {
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
            status: "draft", //Imported episodes are always drafts because they need to be imported to our servers to be published
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

        const episodeAudioFile: AudioFile = {
            id: audioFileId,
            createdAt: new Date(),
            updatedAt: new Date(),
            subscriptionId: subscriptionId,
            name: item.name ?? `audio-file-episode-${index + 1}`,
            length: handleParseInt(item.enclosure?.length),
            duration: parseDurationToSeconds(item.itunes?.duration),
            url: item.enclosure?.url ?? "",
            podcastId: podcastId,
            episodeId: episodeId,
            type: "audio/mpeg",
            blobName: audioFileId,
            isHostedByPS: false,
            isSelected: true,
            peaks: [],
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
