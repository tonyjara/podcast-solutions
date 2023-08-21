import { generatePodcastRssFeed } from "@/components/XML/ItunesFeedBuilder";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { GetServerSideProps } from "next";

const rss = () => {};
export default rss;

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const session = await getServerAuthSession({ req, res });
  const user = session?.user;
  if (!user) return { notFound: true };

  const podcast = await prisma.podcast.findFirst({
    where: {
      user: { some: { id: user.id } },
    },
    include: {
      episodes: { include: { audioFiles: { where: { isSelected: true } } } },
    },
  });

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  if (!podcast || !webUrl) return { notFound: true };
  //At least one episode with realease date in the past
  //With selected audio
  const xml = await generatePodcastRssFeed(podcast);

  res.setHeader("Content-Type", "text/xml");
  res.write(xml);
  res.end();

  return {
    props: {},
  };
};
