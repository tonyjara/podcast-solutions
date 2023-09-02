import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import { Flex } from "@chakra-ui/react";
import { Podcast } from "@prisma/client";
import EpisodesPlaylist from "@/components/EpisodesPlaylist";
import PodcastInfo from "@/components/PodcastInfo";

const PodcastsPage = ({ podcast }: { podcast: Podcast }) => {
  const dynamicTableProps = useDynamicTable();

  const { pageIndex, pageSize } = dynamicTableProps;

  const { data: episodes, isLoading: episodesAreLoading } =
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
    <Flex w="100%" flexDir={"column"} alignContent={"center"}>
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
