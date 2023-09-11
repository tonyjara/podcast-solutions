import {
    Text,
    Image,
    Flex,
    useColorModeValue,
    VStack,
    Icon,
    Card,
    Box,
} from "@chakra-ui/react"
import React from "react"
import TablePagination from "./DynamicTables/TablePagination"
import { FaPlayCircle } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import { useRouter } from "next/router"
import HtmlParser from "./HtmlParser"
import { EpisodeWithAudioFiles } from "@/pageContainers/Podcasts/PodcastsPage"
import { formatDurationSeconds } from "@/lib/utils/durationUtils"

export interface EpisodesPlaylist {
    loading?: boolean
    episodes: EpisodeWithAudioFiles[]
    pageIndex: number
    setPageIndex: React.Dispatch<React.SetStateAction<number>>
    pageSize: number
    setPageSize: React.Dispatch<React.SetStateAction<number>>
    count?: number
    customHeader?: React.ReactNode
    podcastSlug: string
}

const EpisodesPlaylist = ({
    loading,
    episodes,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    count,
    podcastSlug,
}: EpisodesPlaylist) => {
    const backgroundColor = useColorModeValue("white", "gray.800")
    const hoverColor = useColorModeValue("gray.100", "gray.700")
    const removeHtmlTags = (x: string) => x.replace(/(<([^>]+)>)/gi, "")
    const router = useRouter()

    return (
        <Flex
            w="100%"
            backgroundColor={backgroundColor}
            flexDir={"column"}
            alignItems={"center"}
            /* spacing={"10px"} */
            gap={"10px"}
            minH={"50vh"}
        >
            <Flex flexDir={"column"} gap={"20px"} maxW={"1000px"}>
                {!loading &&
                    episodes.map((episode) => {
                        const selectedAudio = episode.audioFiles.find(
                            (audio) => audio.isSelected
                        )
                        const showNotes = removeHtmlTags(episode.showNotes)
                        return (
                            <Box key={episode.id}>
                                {/* LG and up */}
                                <Card
                                    onClick={() =>
                                        router.push(
                                            `/podcasts/${podcastSlug}/${episode.id}`
                                        )
                                    }
                                    variant={"outline"}
                                    display={"flex"}
                                    flexDir={"row"}
                                    justifyContent={"space-between"}
                                    gap={"20px"}
                                    w="100%"
                                    hideBelow={"lg"}
                                    cursor={"pointer"}
                                    borderRadius={"10px"}
                                    p="10px"
                                    _hover={{
                                        backgroundColor: hoverColor,
                                    }}
                                >
                                    <Flex flexDir={"column"}>
                                        <Image
                                            maxW={"100px"}
                                            rounded={"md"}
                                            alt={"Episode image"}
                                            src={episode.imageUrl}
                                            objectFit={"contain"}
                                        />
                                    </Flex>
                                    {/* info block */}
                                    <Flex
                                        w="100%"
                                        gap={"10px"}
                                        flexDir={"column"}
                                        overflowY={"hidden"}
                                    >
                                        <Flex
                                            w="full"
                                            gap={"10px"}
                                            alignItems={"center"}
                                        >
                                            <Icon
                                                as={FaPlayCircle}
                                                color={"green.500"}
                                            />
                                            <Text fontWeight={"bold"}>
                                                #{episode.episodeNumber}-
                                                {episode.title}
                                            </Text>
                                        </Flex>
                                        <HtmlParser
                                            maxL={250}
                                            content={episode.showNotes}
                                            allPTags
                                        />
                                    </Flex>
                                    <Flex
                                        minW={"90px"}
                                        alignItems={"top"}
                                        flexDir={"column"}
                                    >
                                        <Flex alignItems={"center"} gap={"5px"}>
                                            {" "}
                                            <BsClock />{" "}
                                            <Text>
                                                {formatDurationSeconds(
                                                    selectedAudio?.duration ?? 0
                                                )}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Card>

                                {/* MD and down */}
                                <Flex
                                    onClick={() =>
                                        router.push(
                                            `/podcasts/${podcastSlug}/${episode.id}`
                                        )
                                    }
                                    gap={"20px"}
                                    w="100%"
                                    maxW="1000px"
                                    hideFrom={"lg"}
                                    cursor={"pointer"}
                                    borderRadius={"10px"}
                                    p="10px"
                                    _hover={{
                                        backgroundColor: hoverColor,
                                    }}
                                    flexDir={"column"}
                                >
                                    <Flex gap={"10px"}>
                                        <Image
                                            maxW={"60px"}
                                            rounded={"md"}
                                            alt={"feature image"}
                                            src={episode.imageUrl}
                                            objectFit={"contain"}
                                        />
                                        <Flex
                                            gap={"10px"}
                                            alignItems={"center"}
                                        >
                                            <Text fontWeight={"bold"}>
                                                #{episode.episodeNumber}-
                                                {episode.title}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <Flex gap={"10px"} flexDir={"column"}>
                                        <HtmlParser
                                            maxL={200}
                                            content={episode.showNotes}
                                            allPTags
                                        />

                                    </Flex>
                                    <Flex alignItems={"center"} gap={"5px"}>
                                        {" "}
                                        <BsClock />{" "}
                                        <Text>
                                            {formatDurationSeconds(
                                                selectedAudio?.duration ?? 0
                                            )}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Box>
                        )
                    })}
            </Flex>
            {!!count && (
                <TablePagination
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    count={count}
                    data={episodes}
                    noBg
                />
            )}
        </Flex>
    )
}

export default EpisodesPlaylist
