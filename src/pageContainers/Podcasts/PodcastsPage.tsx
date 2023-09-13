import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import { Flex } from "@chakra-ui/react";
import EpisodesPlaylist from "@/components/EpisodesPlaylist";
import PodcastInfo from "@/components/PodcastInfo";
import { PodcastWithDirectoriesAndSubscription } from "@/pages/podcasts/[slug]";
import { Prisma } from "@prisma/client";

export type EpisodeWithAudioFiles = Prisma.EpisodeGetPayload<{
  include: {
    audioFiles: true;
  };
}>;
const PodcastsPage = ({
  podcast,
}: {
  podcast: PodcastWithDirectoriesAndSubscription;
}) => {
  const dynamicTableProps = useDynamicTable();

  const { pageIndex, pageSize } = dynamicTableProps;

  const { data: episodes } =
    trpcClient.episode.getEpisodesWithPodcastId.useQuery({
      pageSize,
      pageIndex,
      podcastId: podcast.id,
    });

  const { data: count } =
    trpcClient.episode.countEpisodesWithPodcastId.useQuery({
      podcastId: podcast.id,
    });

  return (
    <Flex
      p={{ base: 3, md: 10 }}
      w="100%"
      flexDir={"column"}
      alignContent={"center"}
    >
      <PodcastInfo podcast={podcast} />
      <EpisodesPlaylist
        episodes={episodes ?? []}
        podcastSlug={podcast.slug}
        count={count ?? 0}
        {...dynamicTableProps}
      />
    </Flex>
  );
};

export default PodcastsPage;
