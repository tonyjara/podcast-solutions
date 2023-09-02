import { isScheduled } from "@/lib/utils/dateUtils";
import { EpisodeWithAudioFiles } from "@/pageContainers/Home/Episodes/Edit/EpisodesEditPage";
import EpisodePage from "@/pageContainers/Podcasts/Episodes/EpisodesPage";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { Podcast } from "@prisma/client";
import { GetServerSideProps } from "next";

export default EpisodePage;

export const getServerSideProps: GetServerSideProps<{
  episode: EpisodeWithAudioFiles;
  podcast: Podcast;
}> = async (ctx) => {
  const q = ctx.query as { episodeId: string };
  const session = await getServerAuthSession(ctx);
  const episode = await prisma.episode.findUnique({
    where: { id: q.episodeId, status: "published" },
    include: {
      audioFiles: true,
      subscription: {
        select: { active: true, cancelledAt: true, userId: true },
      },
      podcast: true,
    },
  });
  if (!episode) return { notFound: true };

  //Bypasses publishing and other requirements for the owner of the podcast so he can preview changes
  if (session?.user.id === episode?.subscription?.userId) {
    return {
      props: { episode, podcast: episode.podcast },
    };
  }

  if (
    !episode.podcast?.active ||
    !episode.subscription?.active ||
    episode.podcast?.podcastStatus !== "published" ||
    (episode.podcast.publishedAt && isScheduled(episode.podcast.publishedAt)) ||
    episode.status !== "published" ||
    (episode.releaseDate && isScheduled(episode.releaseDate))
  ) {
    return { notFound: true };
  }

  return {
    props: { episode, podcast: episode.podcast },
  };
};
