import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Button,
  Icon,
  Box,
} from "@chakra-ui/react";
import { Directories } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { FaPodcast, FaSpotify } from "react-icons/fa";
import { SiGooglepodcasts, SiStitcher, SiTunein } from "react-icons/si";

const ListenOnModal = ({
  isOpen,
  onClose,
  directories,
}: {
  isOpen: boolean;
  onClose: () => void;
  directories: Directories;
}) => {
  return (
    <Modal
      blockScrollOnMount={false}
      onClose={onClose}
      size={"3xl"}
      isOpen={isOpen}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader ml={"10px"}>Listen On</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={"20px"}>
          <Box>
            {directories.applePodcastsUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.applePodcastsUrl}
                target="_blank"
                leftIcon={<Icon as={FaPodcast} />}
              >
                Apple Podcasts
              </Button>
            )}

            {directories.spotifyUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.spotifyUrl}
                target="_blank"
                leftIcon={<Icon as={FaSpotify} />}
              >
                Spotify
              </Button>
            )}

            {directories.googlePodcastsUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.googlePodcastsUrl}
                target="_blank"
                leftIcon={<Icon as={SiGooglepodcasts} />}
              >
                Google Podcasts
              </Button>
            )}

            {directories.stitcherUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.stitcherUrl}
                target="_blank"
                leftIcon={<Icon as={SiStitcher} />}
              >
                Stitcher
              </Button>
            )}

            {directories.tuneinUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.tuneinUrl}
                target="_blank"
                leftIcon={<Icon as={SiTunein} />}
              >
                Tune in
              </Button>
            )}

            {directories.amazonMusicUrl.length > 0 && (
              <Button
                m="10px"
                as={Link}
                href={directories.amazonMusicUrl}
                target="_blank"
                leftIcon={<Icon as={FaPodcast} />}
              >
                Amazon Music
              </Button>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ListenOnModal;
