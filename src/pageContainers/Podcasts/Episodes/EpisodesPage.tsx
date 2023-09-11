import {
    Image,
    Flex,
    Heading,
    Text,
    Button,
    useClipboard,
    useDisclosure,
    Divider,
} from "@chakra-ui/react"

import { BiRss } from "react-icons/bi"
import EpisodeBreadCrumbs from "./EpisodeBreadCrubs"
import HtmlParser from "@/components/HtmlParser"
import { FaShareAlt } from "react-icons/fa"
import ListenOnModal from "@/components/ListenOnModal"
import MetaTagsComponent from "@/components/Meta/MetaTagsComponent"
import SubscriptionRequiredFloat from "@/components/SubscriptionRequiredFloat"
import {
    EpisodeWithAudioFilesAndSubscription,
    PodcastWithDirectories,
} from "@/pages/podcasts/[slug]/[episodeId]"
import ShareButtons from "@/components/ShareButtons"
import BottomAudioPlayer from "@/components/AudioPlayer/BottomAudioPlayer"

export default function EpisodePage({
    episode,
    podcast,
}: {
    podcast: PodcastWithDirectories
    episode: EpisodeWithAudioFilesAndSubscription
}) {
    const { onCopy, hasCopied } = useClipboard("")
    const { onOpen, onClose, isOpen } = useDisclosure()
    const handleCopyFeed = () => {
        const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${podcast.slug}`
        navigator.clipboard.writeText(feedUrl)
        onCopy()
    }
    const selectedAudioFile = episode.audioFiles?.find(
        (audioFile) => audioFile.isSelected
    )

    return (
        <>
            <MetaTagsComponent
                title={episode.title}
                imageSrc={episode.imageUrl}
                description={episode.showNotes}
                id={episode.id}
            />
            <SubscriptionRequiredFloat
                isFreeTrial={!!episode?.subscription?.isFreeTrial}
            />
            <Flex
                p={{ base: 3, md: 10 }}
                mb={"80px"}
                w="100%"
                justifyContent={"center"}
                flexDir={"row"}
            >
                <Flex w="100%" maxW={"1000px"} flexDir={"column"}>
                    <EpisodeBreadCrumbs
                        episodeTitle={episode.title}
                        podcastTitle={podcast.name}
                        podcastSlug={podcast.slug}
                    />
                    <Flex
                        mb={"30px"}
                        alignItems={"center"}
                        gap={"20px"}
                        flexDir={{ base: "column", sm: "row" }}
                    >
                        <Flex flexDir={"column"} alignSelf={"start"}>
                            <Image
                                maxW={{
                                    base: "100%",
                                    sm: "200px",
                                    md: "300px",
                                }}
                                rounded={"md"}
                                alt={"feature image"}
                                src={episode.imageUrl}
                                objectFit={"contain"}
                            />
                        </Flex>
                        <Flex
                            alignSelf={"start"}
                            gap={"10px"}
                            flexDir={"column"}
                            h={"100%"}
                            justifyContent={"space-between"}
                        >
                            <Flex flexDir={"column"} gap={"10px"}>
                                <Heading size={"lg"}>{episode.title}</Heading>
                                <Flex alignItems={"center"} gap={"10px"}>
                                    <Image
                                        maxW={"25px"}
                                        rounded={"md"}
                                        alt={"feature image"}
                                        src={podcast.imageUrl}
                                        objectFit={"contain"}
                                    />
                                    <Text color="gray.500">
                                        {podcast.name} by {podcast.author}
                                    </Text>
                                </Flex>
                            </Flex>

                            <Flex gap={"20px"}>
                                <Button
                                    onClick={handleCopyFeed}
                                    leftIcon={<BiRss color="orange" />}
                                    maxW={"200px"}
                                    size={"sm"}
                                >
                                    {hasCopied ? "Copied!" : "Copy Feed"}{" "}
                                </Button>

                                {podcast.directories && (
                                    <Button
                                        onClick={() => onOpen()}
                                        leftIcon={<FaShareAlt />}
                                        maxW={"200px"}
                                        size={"sm"}
                                    >
                                        Listen on
                                    </Button>
                                )}
                                <ShareButtons title={episode.title} />
                            </Flex>
                        </Flex>
                    </Flex>
                    <HtmlParser content={episode.showNotes} />

                    {selectedAudioFile && (
                        <BottomAudioPlayer
                            track={{
                                title: episode.title,
                                src: selectedAudioFile.url,
                                author: podcast.author,
                                thumbnail: episode.imageUrl,
                                duration: selectedAudioFile.duration,
                            }}
                        />
                    )}
                </Flex>

                {podcast.directories && (
                    <ListenOnModal
                        onClose={onClose}
                        isOpen={isOpen}
                        directories={podcast.directories}
                    />
                )}
            </Flex>
        </>
    )
}
