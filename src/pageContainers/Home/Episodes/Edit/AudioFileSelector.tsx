import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    Text,
    VStack,
} from "@chakra-ui/react"
import React from "react"
import NewAudioFileModal from "./NewAudioFileModal"
import { trpcClient } from "@/utils/api"
import { FieldErrors } from "react-hook-form"
import { Episode } from "@prisma/client"
import AudioSelectorAudioPlayer from "@/components/AudioPlayer/AudioSelectorAudioPlayer"
import CollapsableContainer from "@/components/CollapsableContainer"
import { AddIcon } from "@chakra-ui/icons"

const AudioFileSelector = ({
    episodeId,
    isOpen,
    onClose,
    errors,
    collapseAll,
    setCollapseAll,
    onOpen,
}: {
    episodeId: string | undefined
    isOpen: boolean
    onClose: () => void
    errors: FieldErrors<Episode>
    collapseAll: boolean
    setCollapseAll: React.Dispatch<React.SetStateAction<boolean>>
    onOpen: () => void
}) => {
    const { data: audioFiles } =
        trpcClient.audioFile.getEpisodeAudioFiles.useQuery(
            {
                episodeId: episodeId,
            },
            { refetchOnWindowFocus: false, enabled: !!episodeId }
        )

    return (
        <CollapsableContainer
            collapseAll={collapseAll}
            setCollapseAll={setCollapseAll}
            title="Audio Files"
            tooltipText="The selected audio file will be used for the episode, it will be the one that appears in the podcast feed and the one used for transcription."
            titleComponents={
                <Button
                    className={!audioFiles?.length ? "glow" : undefined}
                    size={"sm"}
                    rightIcon={<AddIcon fontSize="sm" />}
                    onClick={onOpen}
                >
                    Add{" "}
                </Button>
            }
        >
            <Box>
                <FormControl isInvalid={!!errors.selectedAudioFileId}>
                    {!audioFiles?.length && <Text>You have 0 audio files</Text>}
                    <VStack spacing={10}>
                        {episodeId &&
                            audioFiles?.map((audioFile) => {
                                return (
                                    <AudioSelectorAudioPlayer
                                        key={audioFile.id}
                                        audioFile={audioFile}
                                    />
                                )
                            })}
                    </VStack>
                    {episodeId && (
                        <NewAudioFileModal
                            episodeId={episodeId}
                            isOpen={isOpen}
                            onClose={onClose}
                        />
                    )}
                    <FormErrorMessage>
                        {errors.selectedAudioFileId?.message}
                    </FormErrorMessage>
                </FormControl>
            </Box>
        </CollapsableContainer>
    )
}

export default AudioFileSelector
