import { generatePodcastRssFeed } from "@/components/XML/ItunesFeedBuilder";
import PodcastsPage from "@/pageContainers/Podcasts/PodcastsPage";
import { prisma } from "@/server/db";
import { GetServerSideProps } from "next";
export default PodcastsPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const q = query as { slug: string };

  const podcast = await prisma.podcast.findUnique({
    where: { slug: q.slug, active: true },
    include: {
      episodes: { include: { audioFiles: { where: { isSelected: true } } } },
    },
  });

  const audioFile = podcast?.episodes.at(0)?.audioFiles.at(0);
  if (!podcast || !podcast.active || !audioFile?.url.length)
    return { notFound: true };
  //At least one episode with realease date in the past
  //With selected audio

  return {
    props: { podcast },
  };
};
