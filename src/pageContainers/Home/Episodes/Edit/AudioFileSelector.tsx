import {
    Box,
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

const AudioFileSelector = ({
    episodeId,
    isOpen,
    onClose,
    errors,
}: {
    episodeId: string | undefined
    isOpen: boolean
    onClose: () => void
    errors: FieldErrors<Episode>
}) => {
    const { data: audioFiles } =
        trpcClient.audioFile.getEpisodeAudioFiles.useQuery(
            {
                episodeId: episodeId,
            },
            { enabled: !!episodeId }
        )

    return (
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
    )
}

export default AudioFileSelector
