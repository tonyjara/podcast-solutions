import EpisodesEditPage from "@/pageContainers/Home/Episodes/Edit/EpisodesEditPage";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { type GetServerSideProps } from "next";

export default EpisodesEditPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  const query = context.query as { episodeId: string };
  const episode = await prisma.episode.findUnique({
    where: {
      id: query.episodeId,
      userId: session?.user.id, // This guarantees that the show belongs to the current user
    },
  });

  if (!episode) {
    return {
      notFound: true,
    };
  }

  return {
    props: { episode },
  };
};
