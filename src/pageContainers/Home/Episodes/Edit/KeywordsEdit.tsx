import AreYouSureButton from "@/components/Buttons/AreYouSureButton";
import CollapsableContainer from "@/components/CollapsableContainer";
import FormControlledKeywords from "@/components/Forms/FormControlled/FormControlledKeywords";
import {
  handleUseMutationAlerts,
  myToast,
} from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Episode } from "@prisma/client";
import React from "react";
import { Control, useWatch } from "react-hook-form";
import { SiOpenai } from "react-icons/si";

const KeywordsEdit = ({
  control,
  errors,
  episode,
}: {
  control: Control<any>;
  errors: any;
  episode: Episode | null | undefined;
}) => {
  const context = trpcClient.useContext();

  const showNotes = useWatch({ control, name: "showNotes" });

  const { mutate: generateKeywords, isLoading } =
    trpcClient.chatGPT.generateKeyWordsFromShowNotes.useMutation(
      handleUseMutationAlerts({
        successText: "Show notes generated",
        callback: () => {
          context.invalidate();
        },
      }),
    );

  return (
    <CollapsableContainer
      title="Keywords"
      subTitle="Generate keywords from your show notes"
      titleComponents={
        <AreYouSureButton
          rightIcon={<SiOpenai fontSize={"sm"} />}
          isDisabled={isLoading || !showNotes.length}
          buttonText="Generate"
          confirmAction={() => {
            if (!episode || !episode.showNotes.length) {
              return myToast.error("Show notes is empty");
            }
            generateKeywords({
              episodeId: episode.id,
              showNotes: episode.showNotes,
            });
          }}
          title="Generate keywords"
          modalContent="Are you sure you want to generate keywords? This will overwrite any existing keywords, unsaved changes will be lost."
        />
      }
    >
      <FormControlledKeywords control={control} errors={errors} />
    </CollapsableContainer>
  );
};

export default KeywordsEdit;
