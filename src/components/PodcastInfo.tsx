import {
    Container,
    Image,
    Flex,
    Heading,
    Text,
    Button,
    useClipboard,
    HStack,
    Tag,
    useDisclosure,
} from "@chakra-ui/react"

import { BiRss } from "react-icons/bi"
import HtmlParser from "./HtmlParser"
import ListenOnModal from "./ListenOnModal"
import { PodcastWithDirectoriesAndSubscription } from "@/pages/podcasts/[slug]"
import SubscriptionRequiredFloat from "./SubscriptionRequiredFloat"
import MetaTagsComponent from "./Meta/MetaTagsComponent"
import ShareButtons from "./ShareButtons"
import { BsShare } from "react-icons/bs"

export default function PodcastInfo({
    podcast,
}: {
    podcast: PodcastWithDirectoriesAndSubscription
}) {
    const { onCopy, hasCopied } = useClipboard("")
    const { onOpen, onClose, isOpen } = useDisclosure()
    const handleCopyFeed = () => {
        const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${podcast.slug}`
        navigator.clipboard.writeText(feedUrl)
        onCopy()
    }

    return (
        <>
            <MetaTagsComponent
                title={podcast.name}
                imageSrc={podcast.imageUrl}
                description={podcast.description}
                id={podcast.id}
            />
            <SubscriptionRequiredFloat
                isFreeTrial={!!podcast.subscription?.isFreeTrial}
            />
            <Container maxW={"5xl"} mb={"30px"}>
                <Flex hideFrom={"lg"} justifyContent={"center"} mb={"10px"}>
                    {/* Tried to optimize this but can't because image might come from infinite sources */}
                    <Image
                        maxW={{ base: "100%", sm: "200px", md: "300px" }}
                        rounded={"md"}
                        alt={"feature image"}
                        src={podcast.imageUrl}
                        objectFit={"contain"}
                    />
                </Flex>
                <Flex
                    mb={"20px"}
                    gap={"20px"}
                    flexDir={{ base: "column", sm: "row" }}
                >
                    <Flex
                        hideBelow={"lg"}
                        flexDir={"column"}
                        alignSelf={"start"}
                    >
                        {/* Tried to optimize this but can't because image might come from infinite sources */}
                        <Image
                            maxW={{ base: "100%", sm: "200px", md: "300px" }}
                            rounded={"md"}
                            alt={"feature image"}
                            src={podcast.imageUrl}
                            objectFit={"contain"}
                        />
                    </Flex>
                    <Flex
                        mt={{ base: "0px", md: "10px" }}
                        justifySelf={"start"}
                        gap={"10px"}
                        flexDir={"column"}
                    >
                        <Heading>{podcast.name}</Heading>
                        <Text color="gray.400">By {podcast.author}</Text>
                        <HtmlParser content={podcast.description} />
                        <HStack>
                            {podcast.categories.map((category) => (
                                <Tag key={category} size="sm">
                                    {category}
                                </Tag>
                            ))}
                        </HStack>
                    </Flex>
                </Flex>
                <Flex gap={"20px"} flexDir={{ base: "column", md: "row" }}>
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
                            leftIcon={<BsShare />}
                            maxW={"200px"}
                            size={"sm"}
                        >
                            Listen on
                        </Button>
                    )}
                    <ShareButtons title={podcast.name} />
                </Flex>
                {podcast.directories && (
                    <ListenOnModal
                        onClose={onClose}
                        isOpen={isOpen}
                        directories={podcast.directories}
                    />
                )}
            </Container>
        </>
    )
}
