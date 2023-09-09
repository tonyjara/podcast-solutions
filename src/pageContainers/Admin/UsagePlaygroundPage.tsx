import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { decimalFormat } from "@/lib/utils/DecimalUtils";
import { prettyPriceTags } from "@/lib/utils/enumUtils";
import { trpcClient } from "@/utils/api";
import {
    Box,
    Button,
    Flex,
    FormLabel,
    Heading,
    Input,
    SimpleGrid,
    Skeleton,
    Stat,
    StatLabel,
    StatNumber,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";

const UsagePlaygroundPage = () => {
    const trpcContext = trpcClient.useContext();
    const [chatIO, setChatIO] = useState<{
        inputTokens: number;
        outputTokens: number;
    }>({ inputTokens: 0, outputTokens: 0 });

    const [chatCredits, setChatCredits] = useState<{
        inputTokens: number;
        outputTokens: number;
    }>({ inputTokens: 0, outputTokens: 0 });

    const [transcriptionMinutes, setTranscriptionMinutes] = useState(0);

    const { mutate: getSubscription } =
        trpcClient.stripeUsage.getMySubscription.useMutation(
            handleUseMutationAlerts({
                successText: "subscription fetched",
                callback: (data) => {
                    console.info(data);
                },
            }),
        );
    const { data: myUsage, isLoading } =
        trpcClient.stripeUsage.getMyUsage.useQuery();

    const { mutate: postChatUsage } = trpcClient.admin.postChatUsage.useMutation(
        handleUseMutationAlerts({
            successText: "Usage posted",
            callback: () => {
                trpcContext.invalidate();
            },
        }),
    );

    const { mutate: postTranscriptionMinutes } =
        trpcClient.admin.postTranscriptionMinutesUsage.useMutation(
            handleUseMutationAlerts({
                successText: "Usage posted",
                callback: () => {
                    trpcContext.invalidate();
                },
            }),
        );

    const { mutate: addChatCredits } =
        trpcClient.stripeUsage.addChatCredits.useMutation(
            handleUseMutationAlerts({
                successText: "Credits added",
                callback: () => {
                    trpcContext.invalidate();
                },
            }),
        );
    const statBg = useColorModeValue("white", "gray.700");
    return (
        <Flex
            flexDir={{ base: "column", lg: "row" }}
            justifyContent={"space-evenly"}
        >
            <VStack spacing={10}>
                <Button onClick={() => getSubscription()}>Get subscription</Button>
                <Flex alignItems={"center"}>
                    <Flex flexDir={"column"}>
                        <FormLabel>Chat input</FormLabel>
                        <Input
                            onChange={(e) => {
                                setChatIO({ ...chatIO, inputTokens: parseInt(e.target.value) });
                            }}
                            value={chatIO.inputTokens}
                            type="number"
                        />
                    </Flex>
                    <Flex flexDir={"column"}>
                        <FormLabel>Chat output</FormLabel>
                        <Input
                            value={chatIO.outputTokens}
                            onChange={(e) => {
                                setChatIO({
                                    ...chatIO,
                                    outputTokens: parseInt(e.target.value),
                                });
                            }}
                            type="number"
                        />
                    </Flex>
                    <Button
                        onClick={() =>
                            postChatUsage({
                                inputTokens: chatIO.inputTokens,
                                outputTokens: chatIO.outputTokens,
                            })
                        }
                    >
                        Post chat usage
                    </Button>
                </Flex>
                <Flex alignItems={"center"}>
                    <Flex flexDir={"column"}>
                        <FormLabel>Chat input</FormLabel>
                        <Input
                            onChange={(e) => {
                                setChatCredits({
                                    ...chatCredits,
                                    inputTokens: parseInt(e.target.value),
                                });
                            }}
                            value={chatCredits.inputTokens}
                            type="number"
                        />
                    </Flex>
                    <Flex flexDir={"column"}>
                        <FormLabel>Chat output</FormLabel>
                        <Input
                            value={chatCredits.outputTokens}
                            onChange={(e) => {
                                setChatCredits({
                                    ...chatCredits,
                                    outputTokens: parseInt(e.target.value),
                                });
                            }}
                            type="number"
                        />
                    </Flex>
                    <Button
                        onClick={() =>
                            addChatCredits({
                                inputTokens: chatCredits.inputTokens,
                                outputTokens: chatCredits.outputTokens,
                            })
                        }
                    >
                        Add chat credits
                    </Button>
                </Flex>

                <Flex alignItems={"center"}>
                    <Flex flexDir={"column"}>
                        <FormLabel>Transcription Minutes</FormLabel>
                        <Input
                            onChange={(e) => {
                                setTranscriptionMinutes(parseInt(e.target.value));
                            }}
                            value={transcriptionMinutes}
                            type="number"
                        />
                    </Flex>
                    <Button
                        onClick={() =>
                            postTranscriptionMinutes({
                                durationInMinutes: transcriptionMinutes,
                            })
                        }
                    >
                        Post transcription minutes
                    </Button>
                </Flex>
            </VStack>
            <Box w="full" maxW={"800px"}>
                <Heading mb={"20px"} maxW={"7xl"}>
                    My usage{" "}
                </Heading>
                <SimpleGrid columns={2} spacing={10}>
                    {myUsage?.map((item: any) => {
                        const value = item.data.reduce((acc: any, x: any) => {
                            return (acc += x.total_usage);
                        }, 0);

                        return (
                            item.tag !== "PLAN_FEE" &&
                            item.tag !== "STORAGE_PER_GB" && (
                                <Skeleton key={item.tag} isLoaded={!isLoading}>
                                    <Stat
                                        px={{ base: 4, md: 8 }}
                                        py={"5"}
                                        shadow={"xl"}
                                        bg={statBg}
                                        rounded={"lg"}
                                    >
                                        <StatLabel>{prettyPriceTags(item.tag)}</StatLabel>
                                        <StatNumber>
                                            {" "}
                                            Credits left: {decimalFormat(item.credits)}
                                        </StatNumber>
                                        <StatNumber> Reported: {value}</StatNumber>
                                    </Stat>
                                </Skeleton>
                            )
                        );
                    })}
                </SimpleGrid>
            </Box>
        </Flex>
    );
};

export default UsagePlaygroundPage;
