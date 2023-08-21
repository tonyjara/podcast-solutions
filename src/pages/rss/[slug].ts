import { generatePodcastRssFeed } from "@/components/XML/ItunesFeedBuilder";
import { prisma } from "@/server/db";
import { GetServerSideProps } from "next";

const rss = () => {};
export default rss;

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  const q = query as { slug: string };
  console.log(query);

  const podcast = await prisma.podcast.findUnique({
    where: { slug: q.slug, active: true },
    include: {
      episodes: { include: { audioFiles: { where: { isSelected: true } } } },
    },
  });

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const audioFile = podcast?.episodes.at(0)?.audioFiles.at(0);
  if (!podcast || !podcast.active || !webUrl || !audioFile?.url.length)
    return { notFound: true };
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
