import AreYouSureButton from "@/components/Buttons/AreYouSureButton";
import CollapsableContainer from "@/components/CollapsableContainer";
import FormControlledRichTextBlock from "@/components/Forms/FormControlled/FormControlledRichTextBlock";
import {
  handleUseMutationAlerts,
  myToast,
} from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Episode } from "@prisma/client";
import React from "react";
import { Control } from "react-hook-form";

const TranscriptionEdit = ({
  control,
  errors,
  episode,
}: {
  control: Control<any>;
  errors: any;
  episode: Episode | null | undefined;
}) => {
  const context = trpcClient.useContext();
  const { mutate: transcribe } =
    trpcClient.transcriptions.transcribeAudioFromEpisode.useMutation(
      handleUseMutationAlerts({
        successText: "Transcription generated successfully",
        callback: () => {
          context.invalidate();
        },
      }),
    );
  return (
    <CollapsableContainer
      title="Transcription"
      titleComponents={
        <AreYouSureButton
          isDisabled={!episode || !episode.selectedAudioFileId}
          buttonText="Generate transcription"
          confirmAction={() => {
            if (!episode || !episode.selectedAudioFileId) {
              return myToast.error("No audio file selected");
            }
            transcribe({
              episodeId: episode.id,
              audioFileId: episode.selectedAudioFileId,
            });
          }}
          title="Generate transcription"
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
  );
};

export default TranscriptionEdit;
