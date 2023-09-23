import { manageSubscription } from "@/lib/utils/SubscriptionManagementUtils"
import { episodeForEditArgs } from "@/pageContainers/Home/Episodes/Edit/EpisodeEdit.types"
import EpisodesEditPage from "@/pageContainers/Home/Episodes/Edit/EpisodesEditPage"
import { getServerAuthSession } from "@/server/auth"
import { prisma } from "@/server/db"
import { type GetServerSideProps } from "next"

export default EpisodesEditPage

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)
    const user = session?.user
    if (!user) {
        return { notFound: true }
    }

    const subManager = await manageSubscription(session?.user.id)

    const subscription = await prisma.subscription.findUnique({
        where: {
            userId: user.id,
            active: true,
        },
    })

    if (!subscription) return { notFound: true }

    const query = context.query as { episodeId: string }
    const episode = await prisma.episode.findUnique({
        where: {
            id: query.episodeId,
            subscriptionId: subscription.id,
        },
        ...episodeForEditArgs,
    })

    if (!episode) {
        return {
            notFound: true,
        }
    }
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

    return (
        subManager ?? {
            props: { episode, nextEpisode, prevEpisode },
        }
    )
}
