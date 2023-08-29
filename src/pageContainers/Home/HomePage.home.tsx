import DynamicTable from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useClipboard,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Episode, Prisma } from "@prisma/client";
import NewEpisodeModal from "./NewEpisodeModal";
import { homeEpisodesColumns } from "@/components/DynamicTables/Columns/EpisodesColumns.home";
import NoPodcastAndPodcastEditModal from "./NoPodcastAndPodcastEditModal";
import { BiRss } from "react-icons/bi";
import { useState } from "react";

export default function HomePage() {
  const dynamicTableProps = useDynamicTable();
  const { onCopy, hasCopied } = useClipboard("");

  const { pageIndex, pageSize, sorting } = dynamicTableProps;
  const [whereFilterList, setWhereFilterList] = useState<
    Prisma.EpisodeScalarWhereInput[]
  >([]);
  const router = useRouter();

  const {
    isOpen: isNewEpisodeOpen,
    onOpen: onNewEpisodeOpen,
    onClose: onNewEpisodeClose,
  } = useDisclosure();
  const NoPodcastAndEditToggles = useDisclosure();
  const { onOpen: onOpenNoPodcastAndPodcastEditModal } =
    NoPodcastAndEditToggles;

  const { data: selectedPodcast } =
    trpcClient.podcast.getMySelectedPodcast.useQuery();

  const { data: episodes, isLoading: episodesAreLoading } =
    trpcClient.episode.getMySelectedPodcastEpisodes.useQuery({
      pageSize,
      pageIndex,
      sorting,
      whereFilterList,
    });

  const { data: count } =
    trpcClient.episode.countEpisodesFromSelectedPodcast.useQuery({
      whereFilterList,
    });

  const handleRowClick = (row: Episode) => {
    return router.push(`home/episodes/edit/${row.id}`);
  };
  const handleSubtitleText = () => {
    if (!selectedPodcast) return "You have no podcast selected!";
    if (!episodes?.length) {
      return "You have no episodes! Click the shiny button!";
    }
    if (!selectedPodcast.active) {
      return "Your podcast is missing data to be published. Click the edit button to fix it!";
    }
    return undefined;
  };

  const handleCopyFeed = () => {
    if (!selectedPodcast) return;
    const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${selectedPodcast.slug}`;
    navigator.clipboard.writeText(feedUrl);
    onCopy();
  };

  return (
    <div>
      <DynamicTable
        rowActions={handleRowClick}
        enableColumnFilters={true}
        whereFilterList={whereFilterList}
        setWhereFilterList={setWhereFilterList}
        customHeader={
          <Flex px={{ base: "0px", md: "20px" }} flexDir={"column"}>
            <Flex
              gap={"10px"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Flex alignItems={"center"} gap={"20px"}>
                <Image
                  src={selectedPodcast?.imageUrl}
                  width={"50px"}
                  onClick={onOpenNoPodcastAndPodcastEditModal}
                  objectFit={"contain"}
                  alt="Podcast logo/image"
                  cursor={"pointer"}
                  _hover={{ opacity: 0.8 }}
                />
                <Heading
                  hideBelow={"sm"}
                  gap={"10px"}
                  alignItems={"center"}
                  maxW={"400px"}
                  onClick={onOpenNoPodcastAndPodcastEditModal}
                  cursor={"pointer"}
                  _hover={{ opacity: 0.8 }}
                  fontSize={"2xl"}
                >
                  {selectedPodcast?.name}
                </Heading>
              </Flex>
              <Flex gap={"20px"}>
                <Button
                  onClick={onNewEpisodeOpen}
                  backgroundColor={
                    episodes?.length ||
                    episodesAreLoading ||
                    whereFilterList.length
                      ? undefined
                      : "green.500"
                  }
                  className={
                    episodes?.length ||
                    episodesAreLoading ||
                    whereFilterList.length
                      ? undefined
                      : "glow"
                  }
                >
                  Add episode
                </Button>
                <Button
                  onClick={handleCopyFeed}
                  leftIcon={<BiRss color="orange" />}
                >
                  {hasCopied ? "Copied!" : "Copy Feed"}{" "}
                </Button>
              </Flex>
            </Flex>

            <Text hideBelow={"sm"} as="em" py="10px" px="5px">
              {handleSubtitleText()}{" "}
            </Text>
          </Flex>
        }
        title={selectedPodcast?.name}
        data={episodes ?? []}
        columns={homeEpisodesColumns()}
        count={count ?? 0}
        {...dynamicTableProps}
      />
      <NoPodcastAndPodcastEditModal {...NoPodcastAndEditToggles} />
      <NewEpisodeModal isOpen={isNewEpisodeOpen} onClose={onNewEpisodeClose} />
    </div>
  );
}
