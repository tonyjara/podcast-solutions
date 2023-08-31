import { Text, Heading, Flex, VStack } from "@chakra-ui/react";
import Parser from "rss-parser";

export default function PodcastImportCard({
  feed,
}: {
  feed: Parser.Output<any>;
}) {
  return (
    <VStack spacing={"20px"}>
      <Heading fontSize={"4xl"} fontWeight={"bold"}>
        {feed.title}
      </Heading>
      <Flex w="100%" justifyContent={"space-evenly"}>
        <Text fontSize={"xl"}>{feed.items.length} Episodes</Text>
        <Text fontSize={"xl"}>Author: {feed.itunes?.owner?.name}</Text>
      </Flex>
      <Text fontSize={"xl"}>{feed.description} Episodes</Text>
    </VStack>
  );
}
