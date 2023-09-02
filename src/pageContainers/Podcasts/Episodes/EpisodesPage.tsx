import { EpisodeWithAudioFiles } from "@/pageContainers/Home/Episodes/Edit/EpisodesEditPage";
import {
  Image,
  Flex,
  Heading,
  Text,
  Button,
  useClipboard,
  Tag,
  Box,
} from "@chakra-ui/react";

import { Podcast } from "@prisma/client";
import { BiRss } from "react-icons/bi";
import EpisodeBreadCrumbs from "./EpisodeBreadCrubs";
import HtmlParser from "@/components/HtmlParser";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function EpisodePage({
  episode,
  podcast,
}: {
  podcast: Podcast;
  episode: EpisodeWithAudioFiles;
}) {
  const { onCopy, hasCopied } = useClipboard("");
  const handleCopyFeed = () => {
    const feedUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/rss/${podcast.slug}`;
    navigator.clipboard.writeText(feedUrl);
    onCopy();
  };
  const selectedAudioFile = episode.audioFiles?.find(
    (audioFile) => audioFile.isSelected,
  );
  return (
    <Flex w="100%" justifyContent={"center"} flexDir={"row"}>
      <Flex w="100%" maxW={"1000px"} flexDir={"column"}>
        <EpisodeBreadCrumbs
          episodeTitle={episode.title}
          podcastTitle={podcast.name}
          podcastSlug={podcast.slug}
        />
        <Flex
          mb={"20px"}
          alignItems={"center"}
          gap={"20px"}
          flexDir={{ base: "column", sm: "row" }}
        >
          <Flex flexDir={"column"} alignSelf={"start"}>
            <Image
              maxW={{ base: "100%", sm: "200px", md: "300px" }}
              rounded={"md"}
              alt={"feature image"}
              src={episode.imageUrl}
              objectFit={"contain"}
            />
          </Flex>
          <Flex gap={"10px"} flexDir={"column"}>
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
            <HtmlParser showMoreButton content={episode.showNotes} />
            <Box>
              {episode.keywords.length > 0 &&
                episode.keywords.split(",").map((keyword) => (
                  <Tag
                    whiteSpace={"nowrap"}
                    key={keyword}
                    size="sm"
                    colorScheme="teal"
                  >
                    {keyword}
                  </Tag>
                ))}
            </Box>
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

        {selectedAudioFile?.url && (
          <Box my={"20px"}>
            <ReactPlayer
              url={selectedAudioFile?.url}
              controls={true}
              height={"30px"}
              width={"100%"}
            />
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
