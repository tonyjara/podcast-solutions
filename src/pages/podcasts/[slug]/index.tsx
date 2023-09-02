import { isScheduled } from "@/lib/utils/dateUtils";
import PodcastsPage from "@/pageContainers/Podcasts/PodcastsPage";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { GetServerSideProps } from "next";
export default PodcastsPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = ctx.query as { slug: string };
  const session = await getServerAuthSession(ctx);

  const podcast = await prisma.podcast.findUnique({
    where: { slug: q.slug, active: true },
    include: {
      subscription: { select: { active: true, userId: true } },
    },
  });

  //Bypasses publishing and other requirements for the owner of the podcast so he can preview changes
  if (session?.user.id === podcast?.subscription?.userId) {
    return {
      props: { podcast },
    };
  }

  if (
    !podcast?.active ||
    !podcast?.subscription?.active ||
    podcast?.podcastStatus !== "published" ||
    (podcast.publishedAt && isScheduled(podcast.publishedAt))
  ) {
    return { notFound: true };
  }

  return {
    props: { podcast },
  };
};
