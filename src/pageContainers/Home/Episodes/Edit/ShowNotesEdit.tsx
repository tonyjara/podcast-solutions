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
import { Control, useWatch } from "react-hook-form"
import { SiOpenai } from "react-icons/si"

const ShowNotesEdit = ({
    control,
    errors,
    episode,
    collapseAll,
    setCollapseAll,
}: {
    control: Control<any>
    errors: any
    episode: Episode | null | undefined
    collapseAll: boolean
    setCollapseAll: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const context = trpcClient.useContext()

    const transcription = useWatch({ control, name: "transcription" })

    const { mutate: generateShowNotes, isLoading } =
        trpcClient.chatGPT.generateShowNotesFromTranscription.useMutation(
            handleUseMutationAlerts({
                successText: "Show notes generated",
                callback: () => {
                    context.invalidate()
                },
            })
        )

    return (
        <>
            <CollapsableContainer
                title="Show Notes"
                collapseAll={collapseAll}
                setCollapseAll={setCollapseAll}
                titleComponents={
                    <AreYouSureButton
                        rightIcon={<SiOpenai fontSize={"sm"} />}
                        isDisabled={isLoading || !transcription.length}
                        buttonText="Generate"
                        confirmAction={() => {
                            if (!episode || !episode.transcription.length) {
                                return myToast.error("Transcription is empty")
                            }
                            generateShowNotes({
                                episodeId: episode.id,
                                transcription: episode.transcription,
                            })
                        }}
                        title="Generate Show Notes"
                        modalContent="Are you sure you want to generate show notes? This will overwrite any existing show notes, unsaved changes will be lost."
                    />
                }
            >
                <FormControlledRichTextBlock
                    control={control}
                    errors={errors}
                    name="showNotes"
                    label={
                        transcription.length
                            ? undefined
                            : "To generate show notes, first generate a transcription"
                    }
                />
            </CollapsableContainer>
        </>
    )
}

export default ShowNotesEdit
