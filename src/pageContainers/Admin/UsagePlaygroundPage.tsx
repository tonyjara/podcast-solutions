import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import UsageStats from "@/components/UsageStats";
import { trpcClient } from "@/utils/api";
import { Button, Flex, FormLabel, Input, VStack } from "@chakra-ui/react";
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
      <UsageStats loading={isLoading} myUsage={myUsage} />
    </Flex>
  );
};

export default UsagePlaygroundPage;
