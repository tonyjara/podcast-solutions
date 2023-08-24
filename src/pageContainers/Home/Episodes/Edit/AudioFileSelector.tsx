import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import NewAudioFileModal from "./NewAudioFileModal";
import ReactPlayer from "react-player";
import { EpisodeWithAudioFiles } from "./EpisodesEditPage";
import { DeleteIcon } from "@chakra-ui/icons";
import AreYouSureButton from "@/components/Buttons/AreYouSureButton";
import { trpcClient } from "@/utils/api";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import axios from "axios";
import { FieldErrors } from "react-hook-form";
import { Episode } from "@prisma/client";

const AudioFileSelector = ({
  episode,
  isOpen,
  onClose,
  errors,
}: {
  episode: EpisodeWithAudioFiles;
  isOpen: boolean;
  onClose: () => void;
  errors: FieldErrors<Episode>;
}) => {
  const context = trpcClient.useContext();
  const playerRef = React.useRef<ReactPlayer>(null);
  const { mutate: deleteAudioFile } =
    trpcClient.audioFile.deleteAudioFile.useMutation(
      handleUseMutationAlerts({
        successText: "Audio file deleted",
        callback: () => {
          context.invalidate();
        },
      }),
    );

  const { mutate: selectEpisode } =
    trpcClient.audioFile.selectAudioFileForEpisode.useMutation(
      handleUseMutationAlerts({
        successText: "Audio selected",
        callback: () => {
          context.invalidate();
        },
      }),
    );
  /* const handlePlaybackProgress = () => { */
  /*     const time = playerRef.current?.getCurrentTime(); */
  /* }; */

  return (
    <Box mb={"20px"}>
      <FormControl isInvalid={!!errors.selectedAudioFileId}>
        {!episode?.audioFiles.length && <Text>You have 0 audio files</Text>}
        <VStack spacing={5}>
          {episode?.audioFiles.map((audioFile) => {
            const handleDeleteAudioFile = async () => {
              const req = await axios("/api/get-connection-string");
              const { connectionString } = req.data;

              deleteAudioFile({
                blobName: audioFile.blobName,
                id: audioFile.id,
                connectionString,
                episodeId: episode.id,
              });
            };
            const handleSelectAudioFile = () => {
              if (episode.selectedAudioFileId === audioFile.id) return;

              selectEpisode({
                episodeId: episode.id,
                audioFileId: audioFile.id,
              });
            };

            return (
              <Flex width="100%" flexDir={"column"} key={audioFile.id}>
                <Text fontWeight={"bold"}>{audioFile.name}</Text>
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  gap={"20px"}
                >
                  <Checkbox
                    onChange={handleSelectAudioFile}
                    size={"lg"}
                    isChecked={episode.selectedAudioFileId === audioFile.id}
                  />
                  <ReactPlayer
                    ref={playerRef}
                    url={audioFile.url}
                    controls={true}
                    height={"30px"}
                    width={"100%"}
                  />
                  <AreYouSureButton
                    title={"Delete audio file"}
                    modalContent={
                      "Are you sure you want to delete this audio file? This action cannot be undone."
                    }
                    confirmAction={handleDeleteAudioFile}
                    confirmButtonText={"Delete"}
                    customButton={
                      <IconButton
                        size={"sm"}
                        aria-label="delete audio button"
                        icon={<DeleteIcon />}
                      />
                    }
                  />
                </Flex>
              </Flex>
            );
          })}
        </VStack>
        {episode && (
          <NewAudioFileModal
            episode={episode}
            isOpen={isOpen}
            onClose={onClose}
          />
        )}
        {/* TODO: work on this feature */}
        {/* <Button onClick={handlePlaybackProgress}>Add timestamp</Button> */}
        <FormErrorMessage>
          {errors.selectedAudioFileId?.message}
        </FormErrorMessage>
      </FormControl>
    </Box>
  );
};

export default AudioFileSelector;
