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
  Box,
} from "@chakra-ui/react";

import { Podcast } from "@prisma/client";
import { BiRss } from "react-icons/bi";
import HtmlParser from "./HtmlParser";

export default function PodcastInfo({ podcast }: { podcast: Podcast }) {
  const { onCopy, hasCopied } = useClipboard("");
  const handleCopyFeed = () => {
    const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${podcast.slug}`;
    navigator.clipboard.writeText(feedUrl);
    onCopy();
  };
  return (
    <Container maxW={"5xl"} mb={"30px"}>
      <Flex mb={"20px"} gap={"20px"} flexDir={{ base: "column", sm: "row" }}>
        <Flex flexDir={"column"} alignSelf={"start"}>
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
          <Text color="gray.500">By {podcast.author}</Text>
          <HtmlParser content={podcast.description} />
          <HStack>
            {podcast.categories.map((category) => (
              <Tag key={category} size="sm" colorScheme="teal">
                {category}
              </Tag>
            ))}
          </HStack>
        </Flex>
      </Flex>
      <Box>
        <Button
          onClick={handleCopyFeed}
          leftIcon={<BiRss color="orange" />}
          maxW={"200px"}
          size={"sm"}
        >
          {hasCopied ? "Copied!" : "Copy Feed"}{" "}
        </Button>
      </Box>
    </Container>
  );
}
