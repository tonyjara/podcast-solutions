import PodcastEditForm from "@/components/Forms/PodcastEdit.form"
import PodcastNameForm from "@/components/Forms/PodcastName.Form"
import RssImportForm from "@/components/Forms/RssFeedImporForm"
import { trpcClient } from "@/utils/api"
import {
    Text,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Heading,
    VStack,
    Container,
    Flex,
    Icon,
    Stack,
    useColorModeValue,
} from "@chakra-ui/react"
import { Podcast } from "@prisma/client"
import React, { ReactElement, useState } from "react"
import { BsFillRssFill } from "react-icons/bs"
import { FcAddDatabase } from "react-icons/fc"

//This component is used to show the onboarding modal to the user
const NoPodcastAndPodcastEditModal = ({
    isOpen,
    onClose,
    selectedPodcast,
}: {
    isOpen: boolean
    onClose: () => void
    selectedPodcast: Podcast | null | undefined
}) => {
    const [scratchOrRss, setScratchOrRss] = useState<"scratch" | "rss" | null>(
        null
    )
    const { data: myPrefs } = trpcClient.users.getMyPreferences.useQuery()

    return (
        <Modal
            /* scrollBehavior="outside" */
            blockScrollOnMount={false}
            closeOnOverlayClick={!myPrefs?.hasSeenOnboarding}
            onClose={onClose}
            size={"3xl"}
            isOpen={isOpen}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    {scratchOrRss === "scratch" && !selectedPodcast && (
                        <PodcastNameForm goBack={() => setScratchOrRss(null)} />
                    )}
                    {!scratchOrRss && !selectedPodcast && (
                        <VStack my={4} spacing={5} minH={"300px"}>
                            <Heading fontSize={"4xl"}>
                                Welcome to Podcast Solutions
                            </Heading>
                            <Text fontSize={"xl"}>
                                Are you starting a podcast from scratch or do
                                you have an existing RSS Feed?
                            </Text>
                            <Container maxW={"5xl"} my={3}>
                                <Flex
                                    flexWrap="wrap"
                                    gridGap={6}
                                    justify="center"
                                >
                                    <Card
                                        heading={"From scratch"}
                                        icon={
                                            <Icon
                                                as={FcAddDatabase}
                                                w={10}
                                                h={10}
                                            />
                                        }
                                        action={() =>
                                            setScratchOrRss("scratch")
                                        }
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
                    {scratchOrRss === "rss" && (
                        <RssImportForm goBack={() => setScratchOrRss(null)} />
                    )}

                    {selectedPodcast && (
                        <PodcastEditForm
                            onClose={onClose}
                            podcast={selectedPodcast}
                        />
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default NoPodcastAndPodcastEditModal

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
