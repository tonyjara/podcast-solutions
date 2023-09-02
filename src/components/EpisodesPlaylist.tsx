import {
  Text,
  Image,
  Flex,
  useColorModeValue,
  VStack,
  Icon,
} from "@chakra-ui/react";
import React from "react";
import TablePagination from "./DynamicTables/TablePagination";
import { EpisodeWithAudioFiles } from "@/pageContainers/Home/Episodes/Edit/EpisodesEditPage";
import { FaPlayCircle } from "react-icons/fa";
import { BsClock } from "react-icons/bs";
import { useRouter } from "next/router";
import HtmlParser from "./HtmlParser";

function secondToMinutesAndSeconds(s: number) {
  return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
}

export interface EpisodesPlaylist {
  loading?: boolean;
  episodes: EpisodeWithAudioFiles[];
  pageIndex: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  count?: number;
  customHeader?: React.ReactNode;
  podcastSlug: string;
}

const EpisodesPlaylist = ({
  loading,
  episodes,
  pageIndex,
  setPageIndex,
  pageSize,
  setPageSize,
  count,
  podcastSlug,
}: EpisodesPlaylist) => {
  const backgroundColor = useColorModeValue("white", "gray.800");
  const hoverColor = useColorModeValue("gray.100", "gray.700");
  const removeHtmlTags = (x: string) => x.replace(/(<([^>]+)>)/gi, "");
  const router = useRouter();

  return (
    <VStack
      w="100%"
      backgroundColor={backgroundColor}
      justifyContent={"center"}
      alignItems={"center"}
      spacing={"10px"}
    >
      {!loading &&
        episodes.map((episode) => {
          const selectedAudio = episode.audioFiles.find(
            (audio) => audio.isSelected,
          );
          const showNotes = removeHtmlTags(episode.showNotes);
          return (
            <div key={episode.id}>
              {/* MD and up */}
              <Flex
                onClick={() =>
                  router.push(`/podcasts/${podcastSlug}/${episode.id}`)
                }
                px={"10px"}
                gap={"20px"}
                w="100%"
                maxW="1000px"
                hideBelow={"md"}
                cursor={"pointer"}
                borderRadius={"10px"}
                p="10px"
                _hover={{
                  backgroundColor: hoverColor,
                }}
              >
                <Flex flexDir={"column"}>
                  <Image
                    maxW={"100px"}
                    rounded={"md"}
                    alt={"feature image"}
                    src={episode.imageUrl}
                    objectFit={"contain"}
                  />
                </Flex>
                <Flex gap={"10px"} flexDir={"column"}>
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Icon as={FaPlayCircle} color={"green.500"} />
                    <Text fontWeight={"bold"}>
                      #{episode.episodeNumber}-{episode.title}
                    </Text>
                  </Flex>
                  {/* {episode.showNotes.length > 250 */}
                  {/*   ? `${episode.showNotes.substring(0, 250)}...` */}
                  {/*   : episode.showNotes} */}
                  <HtmlParser maxL={250} content={episode.showNotes} />
                </Flex>
                <Flex alignItems={"center"} gap={"5px"}>
                  {" "}
                  <BsClock />{" "}
                  <Text>
                    {secondToMinutesAndSeconds(selectedAudio?.duration ?? 0)}
                  </Text>
                </Flex>
              </Flex>

              {/* SM and down */}
              <Flex
                onClick={() =>
                  router.push(`/podcasts/${podcastSlug}/${episode.id}`)
                }
                px={"10px"}
                gap={"20px"}
                w="100%"
                maxW="1000px"
                hideFrom={"md"}
                cursor={"pointer"}
                borderRadius={"10px"}
                p="10px"
                _hover={{
                  backgroundColor: hoverColor,
                }}
                flexDir={"column"}
              >
                <Flex gap={"10px"}>
                  <Image
                    maxW={"60px"}
                    rounded={"md"}
                    alt={"feature image"}
                    src={episode.imageUrl}
                    objectFit={"contain"}
                  />
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Text fontWeight={"bold"}>
                      #{episode.episodeNumber}-{episode.title}
                    </Text>
                  </Flex>
                </Flex>
                <Flex gap={"10px"} flexDir={"column"}>
                  {showNotes.length > 250
                    ? `${showNotes.substring(0, 250)}...`
                    : showNotes}
                </Flex>
                <Flex alignItems={"center"} gap={"5px"}>
                  {" "}
                  <BsClock />{" "}
                  <Text>
                    {secondToMinutesAndSeconds(selectedAudio?.duration ?? 0)}
                  </Text>
                </Flex>
              </Flex>
            </div>
          );
        })}
      {!!count && (
        <TablePagination
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          count={count}
          data={episodes}
        />
      )}
    </VStack>
  );
};

export default EpisodesPlaylist;
