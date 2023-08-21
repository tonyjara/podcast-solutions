import FormControlledAudioUpload from "@/components/Forms/FormControlled/FormControlledAudioUpload";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import {
  handleUseMutationAlerts,
  myToast,
} from "@/components/Toasts & Alerts/MyToast";
import {
  defaultAudioFile,
  vailidateAudioFile,
} from "@/components/Validations/Validate.AudioFile";
import { trpcClient } from "@/utils/api";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Button,
  Flex,
  Text,
  Collapse,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AudioFile, Episode } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";

const NewAudioFileModal = ({
  isOpen,
  onClose,
  episode,
}: {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
}) => {
  const user = useSession().data?.user;
  const [formProgress, setFormProgress] = React.useState(0);

  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AudioFile>({
    defaultValues: defaultAudioFile({
      userId: user?.id ?? "",
      episodeId: episode.id,
      podcastId: episode.podcastId,
    }),
    resolver: zodResolver(vailidateAudioFile),
  });
  const handleClose = () => {
    reset();
    onClose();
    setFormProgress(0);
  };

  const { mutate: createAudioFile } =
    trpcClient.audioFile.createAudioFileForEpisode.useMutation(
      handleUseMutationAlerts({
        successText: "Audio file created successfully!",
        callback: () => {
          trpcContext.invalidate();
          handleClose();
        },
      }),
    );

  const { mutate: checkIfNameIsUnique } =
    trpcClient.audioFile.checkIfNameIsUniqueForEpisode.useMutation({
      onSuccess: ({ isUnique }) => {
        if (!isUnique) {
          return myToast.error(
            "You have an audio file with a similar name, please choose a different one.",
          );
        }
        return setFormProgress(1);
      },
    });

  const handleCheckIfNameIsUnique = () => {
    checkIfNameIsUnique({
      name: getValues("name"),
      episodeId: episode.id,
    });
  };

  const submitFunc = async (data: AudioFile) => {
    createAudioFile(data);
  };

  return (
    <Modal
      blockScrollOnMount={false}
      onClose={handleClose}
      size={"3xl"}
      isOpen={isOpen}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Audio File</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(submitFunc)} noValidate>
            <Flex flexDir={"column"} gap={5}>
              <Collapse in={formProgress === 0}>
                <Text>
                  Pick a reference name for your audio file, it won't be visible
                  to the public.
                </Text>
                <FormControlledText
                  control={control}
                  errors={errors}
                  name="name"
                  label="Audio File Name"
                  autoFocus={true}
                  helperText="Example: 'Episode 1'"
                />
              </Collapse>
              <Collapse in={formProgress === 1}>
                {user && (
                  <FormControlledAudioUpload
                    errors={errors}
                    fieldName="url"
                    label="Audio File Upload"
                    setValue={setValue}
                    getValues={getValues}
                    helperText="Upload your audio file here, only mp3 files are allowed."
                    userId={user.id}
                    uploadCallback={() => handleSubmit(submitFunc)()}
                    episodeId={episode.id}
                  />
                )}
              </Collapse>
              <Flex justifyContent={"space-between"}>
                <Button
                  isLoading={isSubmitting}
                  size="lg"
                  isDisabled={formProgress === 0}
                  alignSelf={"flex-end"}
                  onClick={() => setFormProgress(0)}
                >
                  Prev
                </Button>

                {formProgress === 0 && (
                  <Button
                    isLoading={isSubmitting}
                    colorScheme="green"
                    size="lg"
                    alignSelf={"flex-end"}
                    onClick={handleCheckIfNameIsUnique}
                    isDisabled={!isDirty}
                  >
                    Next
                  </Button>
                )}
                {formProgress === 1 && (
                  <Button
                    isLoading={isSubmitting}
                    colorScheme="green"
                    size="lg"
                    alignSelf={"flex-end"}
                    /* onClick={() => setFormProgress(1)} */
                    onClick={() => handleSubmit(submitFunc)()}
                    /* isDisabled={formProgress === 1 || !isDirty} */
                  >
                    Upload to save
                  </Button>
                )}
              </Flex>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewAudioFileModal;
