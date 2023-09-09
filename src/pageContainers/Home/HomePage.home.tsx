import DynamicTable from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import {
    Box,
    Button,
    Card,
    Flex,
    Heading,
    Image,
    Spinner,
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
import PodcastStatusMenu from "./PodcastStatusMenu";

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

    const { data: selectedPodcast, isLoading: selectedPodcastIsLoading } =
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
            return (
                <Text hideBelow={"sm"} as="em" py="10px" px="5px">
                    You have no episodes! Click the shiny button!"
                </Text>
            );
        }
        return (
            <Text mb={"5px"} mt={"25px"} fontSize={"2xl"} fontWeight={"semibold"}>
                {" "}
                Episode List
            </Text>
        );
    };

    const handleCopyFeed = () => {
        if (!selectedPodcast) return;
        const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${selectedPodcast.slug}`;
        navigator.clipboard.writeText(feedUrl);
        onCopy();
    };

    return (
        <Box
            px={{ base: 3, md: 5 }}
            py={{ base: 3, md: 3 }}
        >
            <DynamicTable
                rowActions={handleRowClick}
                loading={episodesAreLoading || selectedPodcastIsLoading}
                enableColumnFilters={true}
                whereFilterList={whereFilterList}
                setWhereFilterList={setWhereFilterList}
                title={"Episodes"}
                customHeader={
                    <Flex mb={{ base: "20px", md: "0px" }} flexDir={"column"}>
                        <Card
                            p={{ base: "10px", md: "10px" }}
                            bg={"gray.100"}
                            _dark={{ bg: "gray.700" }}
                            gap={"10px"}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            flexDir={{ base: "row", sm: "column", md: "column", lg: "row" }}
                            overflowX={"auto"}
                            overflowY={"hidden"}
                        >
                            <Flex hideBelow={"sm"} alignItems={"center"} gap={"20px"}>
                                {selectedPodcastIsLoading ||
                                    (episodesAreLoading && <Spinner />)}
                                {selectedPodcast?.imageUrl && (
                                    <Image
                                        src={selectedPodcast?.imageUrl}
                                        width={"50px"}
                                        onClick={onOpenNoPodcastAndPodcastEditModal}
                                        objectFit={"contain"}
                                        borderRadius={"md"}
                                        alt="Podcast logo/image"
                                        cursor={"pointer"}
                                        _hover={{ opacity: 0.8 }}
                                    />
                                )}
                                <Heading
                                    gap={"10px"}
                                    alignItems={"center"}
                                    maxW={"500px"}
                                    onClick={onOpenNoPodcastAndPodcastEditModal}
                                    cursor={"pointer"}
                                    _hover={{ opacity: 0.8 }}
                                    fontSize={"2xl"}
                                >
                                    {selectedPodcast?.name}
                                </Heading>
                            </Flex>
                            <Flex gap={"20px"}>
                                {selectedPodcast?.imageUrl && (
                                    <Image
                                        hideFrom={"sm"}
                                        src={selectedPodcast?.imageUrl}
                                        width={"50px"}
                                        onClick={onOpenNoPodcastAndPodcastEditModal}
                                        objectFit={"contain"}
                                        alt="Podcast logo/image"
                                        cursor={"pointer"}
                                        _hover={{ opacity: 0.8 }}
                                    />
                                )}

                                {selectedPodcast && (
                                    <PodcastStatusMenu podcast={selectedPodcast} />
                                )}
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
                        </Card>
                        {/* <Text hideBelow={"sm"} as="em" py="10px" px="5px"> */}
                        {handleSubtitleText()} {/* </Text> */}
                    </Flex>
                }
                data={episodes ?? []}
                columns={homeEpisodesColumns()}
                count={count ?? 0}
                {...dynamicTableProps}
            />
            <NoPodcastAndPodcastEditModal {...NoPodcastAndEditToggles} />
            <NewEpisodeModal isOpen={isNewEpisodeOpen} onClose={onNewEpisodeClose} />
        </Box>
    );
}
