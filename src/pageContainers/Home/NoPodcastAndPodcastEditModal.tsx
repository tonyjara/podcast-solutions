import PodcastEditForm from "@/components/Forms/PodcastEdit.form";
import PodcastNameForm from "@/components/Forms/PodcastName.Form";
import RssImportForm from "@/components/Forms/RssFeedImporForm";
import { trpcClient } from "@/utils/api";
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
} from "@chakra-ui/react";
import React, { ReactElement, useEffect, useState } from "react";
import { BsFillRssFill } from "react-icons/bs";
import { FcAddDatabase } from "react-icons/fc";

const NoPodcastAndPodcastEditModal = ({
  isOpen,
  onClose,
  onOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) => {
  /* const { isOpen, onOpen, onClose } = useDisclosure(); */
  const [scratchOrRss, setScratchOrRss] = useState<"scratch" | "rss" | null>(
    null,
  );
  const { data, isLoading } = trpcClient.users.getMyPreferences.useQuery();
  const { data: podcasts } = trpcClient.podcast.getMyPodcasts.useQuery();

  useEffect(() => {
    if (podcasts?.length || isLoading || isOpen) return;
    if (!data || !data.hasSeenOnboarding || !podcasts?.length) {
      onOpen();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcasts, data, isOpen]);

  return (
    <Modal
      blockScrollOnMount={false}
      /* scrollBehavior="outside" */
      /* closeOnOverlayClick={!podcasts?.length} */
      onClose={onClose}
      size={"3xl"}
      isOpen={isOpen}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          {scratchOrRss === "scratch" && (
            <PodcastNameForm goBack={() => setScratchOrRss(null)} />
          )}
          {!scratchOrRss && !podcasts?.length && (
            <VStack my={4} spacing={5} minH={"300px"}>
              <Heading fontSize={"4xl"}>Welcome to Podcast Solutions</Heading>
              <Text fontSize={"xl"}>
                Are you starting a podcast from scratch or do you have an
                existing RSS Feed?
              </Text>
              <Container maxW={"5xl"} my={3}>
                <Flex flexWrap="wrap" gridGap={6} justify="center">
                  <Card
                    heading={"From scratch"}
                    icon={<Icon as={FcAddDatabase} w={10} h={10} />}
                    action={() => setScratchOrRss("scratch")}
                  />
                  <Card
                    heading={"From Rss Feed"}
                    icon={
                      <Icon color="orange" as={BsFillRssFill} w={10} h={10} />
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

          {podcasts && podcasts[0] && (
            <PodcastEditForm onClose={onClose} podcast={podcasts[0]} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NoPodcastAndPodcastEditModal;

interface CardProps {
  heading: string;
  action: () => void;
  icon: ReactElement;
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
  );
};
