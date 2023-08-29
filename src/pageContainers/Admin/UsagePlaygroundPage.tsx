import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Decimal from "decimal.js";
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
  const { mutate: getSubscription } =
    trpcClient.stripeUsage.getMySubscription.useMutation(
      handleUseMutationAlerts({
        successText: "subscription fetched",
        callback: (data) => {
          console.log(data);
        },
      }),
    );
  const { data: myUsage } = trpcClient.stripeUsage.getMyUsage.useQuery();
  const { mutate: postChatUsage } =
    trpcClient.stripeUsage.postChatUsage.useMutation(
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
      </VStack>
      <Box>
        <Heading mb={"20px"} maxW={"7xl"}>
          Usage
        </Heading>
        <SimpleGrid columns={2} spacing={10}>
          {myUsage?.map((item) => {
            const value = item.data.reduce((acc: any, x: any) => {
              return (acc += x.total_usage);
            }, 0);

            return (
              <StatsCard
                key={item.tag}
                title={item.tag}
                credits={item.credits}
                value={value}
              />
            );
          })}
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

export default UsagePlaygroundPage;

const StatsCard = ({
  title,
  value,
  credits,
}: {
  title: string;
  value: string;
  credits?: Decimal;
}) => {
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <StatLabel>{title}</StatLabel>
      <StatNumber> Credits: {credits?.toString() ?? 0}</StatNumber>
      <StatNumber> Used: {value}</StatNumber>
    </Stat>
  );
};
