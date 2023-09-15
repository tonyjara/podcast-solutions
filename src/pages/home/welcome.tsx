import PodcastEditForm from "@/components/Forms/PodcastEdit.form"
import PodcastNameForm from "@/components/Forms/PodcastName.Form"
import RssImportForm from "@/components/Forms/RssFeedImporForm"
import { manageSubscription } from "@/lib/utils/SubscriptionManagementUtils"
import { getServerAuthSession } from "@/server/auth"
import { prisma } from "@/server/db"
import {
    Heading,
    VStack,
    Text,
    Container,
    Flex,
    Icon,
    Box,
    useColorModeValue,
    Stack,
} from "@chakra-ui/react"
import { Podcast } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import React, { ReactElement, useState } from "react"
import { BsFillRssFill } from "react-icons/bs"
import { FcAddDatabase } from "react-icons/fc"

const WelcomePage = () => {
    const router = useRouter()
    const [createdPodcast, setCreatedPodcast] = useState<Podcast | null>(null)
    const [scratchOrRss, setScratchOrRss] = useState<"scratch" | "rss" | null>(
        null
    )
    const bg = useColorModeValue("gray.50", "gray.700")
    return (
        <Flex w="full" justifyContent={"center"} p={{ base: 3, md: 10 }}>
            <Box
                /* outline={"solid 1px"} */
                borderRadius={"md"}
                w="full"
                maxW={"800px"}
                bg={bg}
                p={5}
            >
                {scratchOrRss === "scratch" && !createdPodcast && (
                    <PodcastNameForm
                        setCreatedPodcast={setCreatedPodcast}
                        goBack={() => setScratchOrRss(null)}
                    />
                )}
                {scratchOrRss === "rss" && !createdPodcast && (
                    <RssImportForm
                        setCreatedPodcast={setCreatedPodcast}
                        goBack={() => setScratchOrRss(null)}
                    />
                )}
                {createdPodcast && (
                    <PodcastEditForm
                        onClose={() => router.push("/home")}
                        podcast={createdPodcast}
                    />
                )}
                {!scratchOrRss && !createdPodcast && (
                    <VStack my={4} spacing={5} minH={"300px"}>
                        <Heading fontSize={"4xl"}>
                            Welcome to Podcast Solutions
                        </Heading>
                        <Text fontSize={"xl"}>
                            Are you starting a podcast from scratch or do you
                            have an existing RSS Feed?
                        </Text>
                        <Container maxW={"5xl"} my={3}>
                            <Flex flexWrap="wrap" gridGap={6} justify="center">
                                <Card
                                    heading={"From scratch"}
                                    icon={
                                        <Icon
                                            as={FcAddDatabase}
                                            w={10}
                                            h={10}
                                        />
                                    }
                                    action={() => setScratchOrRss("scratch")}
                                />
                                <Card
                                    heading={"From Rss Feed"}
                                    icon={
                                        <Icon
                                            color="orange"
                                            as={BsFillRssFill}
                                            w={10}
                                            h={10}
                                        />
                                    }
                                    action={() => setScratchOrRss("rss")}
                                />
                            </Flex>
                        </Container>
                    </VStack>
                )}
            </Box>
        </Flex>
    )
}

export default WelcomePage

interface CardProps {
    heading: string
    action: () => void
    icon: ReactElement
}

const Card = ({ heading, icon, action }: CardProps) => {
    return (
        <Box
            maxW={{ base: "full", md: "275px" }}
            w={"full"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={useColorModeValue("white", "gray.800")}
            p={5}
            cursor={"pointer"}
            _hover={{
                bg: useColorModeValue("gray.200", "gray.600"),
            }}
            onClick={action}
        >
            <Stack align={"start"} spacing={2}>
                <Flex
                    w={16}
                    h={16}
                    align={"center"}
                    justify={"center"}
                    color={"white"}
                    rounded={"full"}
                    bg={useColorModeValue("gray.100", "gray.700")}
                >
                    {icon}
                </Flex>
                <Box mt={2}>
                    <Heading size="md">{heading}</Heading>
                </Box>
            </Stack>
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)
    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
            props: {},
        }
    }

    const subManager = await manageSubscription(session?.user.id)

    const user = session.user
    const prefs = await prisma.preferences.findUnique({
        where: { userId: user.id },
    })

    //Redirect user that has not setup his podcast
    if (prefs?.selectedPodcastId) {
        return {
            redirect: {
                destination: "/home/",
                permanent: false,
            },
            props: {},
        }
    }

    return (
        subManager ?? {
            props: {},
        }
    )
}
