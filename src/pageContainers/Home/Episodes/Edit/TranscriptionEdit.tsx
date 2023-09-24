import AreYouSureButton from "@/components/Buttons/AreYouSureButton"
import CollapsableContainer from "@/components/CollapsableContainer"
import FormControlledRichTextBlock from "@/components/Forms/FormControlled/FormControlledRichTextBlock"
import {
    handleUseMutationAlerts,
    myToast,
} from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import { Episode } from "@prisma/client"
import React from "react"
import { Control } from "react-hook-form"
import { SiOpenai } from "react-icons/si"

const TranscriptionEdit = ({
    control,
    errors,
    episode,
    collapseAll,
    setCollapseAll,
    hasAudioFiles,
}: {
    control: Control<any>
    errors: any
    episode: Episode | null | undefined
    collapseAll: boolean
    setCollapseAll: React.Dispatch<React.SetStateAction<boolean>>
    hasAudioFiles: boolean
}) => {
    const context = trpcClient.useContext()
    const { mutate: transcribe } =
        trpcClient.transcriptions.transcribeAudioFromEpisode.useMutation(
            handleUseMutationAlerts({
                successText: "Transcription generated successfully",
                callback: () => {
                    context.invalidate()
                },
            })
        )

    /* const { data: selecteAudioFile } = */
    /*     trpcClient.audioFile.getSelectedAudioFileForEpisode.useQuery({ */
    /*         episodeId: episode?.id, */
    /*     }) */

    return (
        <CollapsableContainer
            title="Transcription"
            collapseAll={collapseAll}
            setCollapseAll={setCollapseAll}
            subTitle={
                hasAudioFiles
                    ? undefined
                    : "Upload an audio file to generate a transcription"
            }
            titleComponents={
                <AreYouSureButton
                    rightIcon={<SiOpenai fontSize={"sm"} />}
                    isDisabled={!episode || !hasAudioFiles}
                    buttonText="Generate"
                    confirmAction={() => {
                        if (!episode || !hasAudioFiles) {
                            return myToast.error("No audio file selected")
                        }
                        transcribe({
                            episodeId: episode.id,
                        })
                    }}
                    title="Generate Transcription"
                    modalContent="Are you sure you want to generate a transcription? This will overwrite any existing transcription, unsaved changes will be lost."
                />
            }
        >
            <FormControlledRichTextBlock
                control={control}
                errors={errors}
                name="transcription"
            />
        </CollapsableContainer>
    )
}

export default TranscriptionEdit
