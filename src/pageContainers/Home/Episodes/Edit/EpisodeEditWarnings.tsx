import AreYouSureButton from "@/components/Buttons/AreYouSureButton"
import { myToast } from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import { WarningTwoIcon } from "@chakra-ui/icons"
import {
    Text,
    Heading,
    Card,
    Flex,
    ListItem,
    UnorderedList,
    Button,
} from "@chakra-ui/react"
import { AudioFile } from "@prisma/client"
import axios from "axios"
import { useSession } from "next-auth/react"
import React, { useState } from "react"

const EpisodeEditWarnings = function EpWarnings({
    audioFiles,
}: {
    audioFiles: AudioFile[]
}) {
    const [showWarning, setShowWarning] = useState(true)
    const trpcContext = trpcClient.useContext()
    const user = useSession().data?.user

    const someAudioFilesAreNotInOurDatabase = audioFiles.some(
        (x) => !x.isHostedByPS
    )

    const totalAudioFilesSize = audioFiles.reduce((acc, curr) => {
        return acc + curr.length
    }, 0)
    const totalAudioFilesSizeInMb = (totalAudioFilesSize / 1000000).toFixed(2)

    const saveAudioFileToPs = async () => {
        if (!user) return
        for await (const audioFile of audioFiles) {
            try {
                myToast.loading()
                const req = await axios.post(
                    "/api/upload-audio-file-from-url",
                    {
                        audioFileId: audioFile.id,
                    }
                )
                if (req.data.error) throw new Error(req.data.error)
                myToast.dismiss()
                myToast.success("Audio file saved to our servers")
                trpcContext.invalidate()
            } catch (err) {
                myToast.dismiss()
                myToast.error()
                console.error(err)
            }
        }
    }

    return (
        <>
            {someAudioFilesAreNotInOurDatabase && showWarning && (
                <Card
                    variant={"outline"}
                    borderColor={"orange.300"}
                    py={4}
                    px={6}
                    gap={"10px"}
                >
                    <Flex gap={"10px"} alignItems={"center"}>
                        <WarningTwoIcon boxSize={"20px"} color={"orange.300"} />
                        <Heading as="h2" size="md">
                            Some features might not work
                        </Heading>
                    </Flex>
                    <Text opacity={0.7}>
                        {" "}
                        Because this episode was imported from an existing RSS
                        feed, the audio files are not hosted in our servers.
                        This can cause the following issues:
                    </Text>
                    <UnorderedList>
                        <ListItem opacity={0.7}>
                            Episode publication is not possible. We can't
                            guarantee availability of the audio files unless
                            they're hosted with us.
                        </ListItem>
                        <ListItem opacity={0.7}>
                            Timestamp tool is affected, audio waveform might not
                            be able to be generated if the audio files are not
                            located in our servers.
                        </ListItem>
                    </UnorderedList>
                    <Text opacity={0.7}>
                        You can safely ignore this if you're not planning to
                        publish yet.
                    </Text>
                    <Flex alignSelf={"end"} gap={"10px"}>
                        <Button
                            onClick={() => setShowWarning(false)}
                            size={"sm"}
                            variant={"outline"}
                        >
                            Ignore
                        </Button>
                        <AreYouSureButton
                            title={"Import audio files"}
                            modalContent={`By accepting this, we'll copy the audio files to our servers. This is going to count towards your storage quota. Total to be stored: ${totalAudioFilesSizeInMb} MB. Unsaved changes will be lost.`}
                            confirmAction={saveAudioFileToPs}
                            confirmButtonText={"Resolve"}
                            buttonText={"Resolve"}
                        />
                    </Flex>
                </Card>
            )}
        </>
    )
}

export default EpisodeEditWarnings
