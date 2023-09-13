import { isScheduled } from "@/lib/utils/dateUtils"
import EpisodePage from "@/pageContainers/Podcasts/Episodes/EpisodesPage"
import { getServerAuthSession } from "@/server/auth"
import { prisma } from "@/server/db"
import { Podcast, Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"

export type PodcastWithDirectories = Prisma.PodcastGetPayload<{
    include: {
        directories: true
    }
}>

export type EpisodeWithAudioFilesAndSubscription = Prisma.EpisodeGetPayload<{
    include: {
        audioFiles: true
        subscription: {
            select: {
                active: true
                cancelledAt: true
                userId: true
                isFreeTrial: true
            }
        }
    }
}>
export default EpisodePage

export const getServerSideProps: GetServerSideProps<{
    episode: EpisodeWithAudioFilesAndSubscription
    podcast: Podcast
}> = async (ctx) => {
    const q = ctx.query as { episodeId: string }
    const session = await getServerAuthSession(ctx)
    const episode = await prisma.episode.findUnique({
        where: { id: q.episodeId, status: "published" },
        include: {
            audioFiles: true,
            subscription: {
                select: {
                    active: true,
                    cancelledAt: true,
                    userId: true,
                    isFreeTrial: true,
                },
            },
            podcast: { include: { directories: true } },
        },
    })
    if (!episode) return { notFound: true }

    const nextEpisode = await prisma.episode.findFirst({
        where: {
            podcastId: episode.podcastId,
            status: "published",
            episodeNumber: { gt: episode.episodeNumber },
            releaseDate: { lt: new Date() },
        },
        orderBy: { episodeNumber: "asc" },
        select: { id: true },
    })

    const prevEpisode = await prisma.episode.findFirst({
        where: {
            podcastId: episode.podcastId,
            status: "published",
            episodeNumber: { lt: episode.episodeNumber },
            releaseDate: { lt: new Date() },
        },
        orderBy: { episodeNumber: "desc" },
        select: { id: true },
    })
    //Bypasses publishing and other requirements for the owner of the podcast so he can preview changes
    if (session?.user.id === episode?.subscription?.userId) {
        return {
            props: {
                episode,
                podcast: episode.podcast,
                nextEpisode,
                prevEpisode,
            } as EpisodePageProps,
        }
    }

    if (
        !episode.podcast?.active ||
        !episode.subscription?.active ||
        episode.subscription.isFreeTrial ||
        episode.podcast?.podcastStatus !== "published" ||
        (episode.podcast.publishedAt &&
            isScheduled(episode.podcast.publishedAt)) ||
        episode.status !== "published" ||
        (episode.releaseDate && isScheduled(episode.releaseDate))
    ) {
        return { notFound: true }
    }

    return {
        props: {
            episode,
            podcast: episode.podcast,
            nextEpisode,
            prevEpisode,
        } as EpisodePageProps,
    }
}

export interface EpisodePageProps {
    episode: EpisodeWithAudioFilesAndSubscription
    podcast: PodcastWithDirectories
    nextEpisode: { id: string } | undefined
    prevEpisode: { id: string } | undefined
}
