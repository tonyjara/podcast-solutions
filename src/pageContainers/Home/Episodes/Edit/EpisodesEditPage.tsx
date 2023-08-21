import {
  Text,
  Box,
  Button,
  Flex,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlledEditableText from "@/components/Forms/FormControlled/FormControlledEditable";
import FormControlledSwitch from "@/components/Forms/FormControlled/FormControlledSwitch";
import slugify from "@sindresorhus/slugify";
import { useSession } from "next-auth/react";
import { AudioFile, Episode } from "@prisma/client";
import {
  defaultEpisodeValues,
  validateEpisodeEdit,
} from "@/components/Validations/EpisodeEdit.validate";
import { useForm, useWatch } from "react-hook-form";
import FormControlledImageUpload from "@/components/Forms/FormControlled/FormControlledImageUpload";
import AudioFileSelector from "./AudioFileSelector";
import CollapsableContainer from "@/components/CollapsableContainer";
import FormControlledSelect from "@/components/Forms/FormControlled/FormControlledSelect";
import TranscriptionEdit from "./TranscriptionEdit";
import ChatDrawer from "@/components/ChatDrawer";
import ShowNotesEdit from "./ShowNotesEdit";
import FormControlledDatePicker from "@/components/Forms/FormControlled/FormControlledDatePicker";

export type EpisodeWithAudioFiles =
  | (Episode & {
      audioFiles: AudioFile[];
    })
  | null
  | undefined;

const EpisodesEditPage = ({ episode }: { episode: Episode }) => {
  const user = useSession().data?.user;
  const audioModalDisclosure = useDisclosure();
  const { onOpen } = audioModalDisclosure;

  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Episode>({
    defaultValues: defaultEpisodeValues,
    resolver: zodResolver(validateEpisodeEdit),
  });
  const { mutate, isLoading } = trpcClient.episode.editEpisode.useMutation(
    handleUseMutationAlerts({
      successText: "Changes saved",
      callback: () => {
        trpcContext.invalidate();
      },
    }),
  );

  const { data: fetchedEpisode } =
    trpcClient.episode.getEpisodeWithAudioFiles.useQuery({ id: episode.id });

  useEffect(() => {
    if (!fetchedEpisode) return;
    reset(fetchedEpisode);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedEpisode]);

  const submitFunc = async (data: Episode) => {
    mutate(data);
  };

  const episodeTitle = useWatch({ control, name: "title" });

  return (
    <Box w="100%" display={"flex"} justifyContent={"center"} pb={"100px"}>
      <Flex maxW={"1000px"} flexDir={"column"} gap={13}>
        <form onSubmit={handleSubmit(submitFunc)} noValidate>
          <Flex
            justifyContent={"space-between"}
            w="100%"
            alignItems={"center"}
            gap={5}
            mb={"40px"}
          >
            <Flex gap={"20px"}>
              <Box minW={"160px"}>
                <FormControlledSelect
                  control={control}
                  errors={errors}
                  name="status"
                  options={[
                    { value: "draft", label: "Draft 🟠" },
                    { value: "published", label: "Published 🟢" },
                  ]}
                />
              </Box>
              <FormControlledEditableText
                control={control}
                errors={errors}
                name="title"
              />
            </Flex>
            <Button
              onClick={() => handleSubmit(submitFunc)()}
              isDisabled={isSubmitting || isLoading}
              colorScheme="blue"
            >
              Save changes
            </Button>
          </Flex>
          <VStack spacing={10} alignItems={"flex-start"}>
            <FormControlledDatePicker
              control={control}
              errors={errors}
              name="releaseDate"
              maxW={"200px"}
              label="Release date"
            />
            <Text color={"gray.500"} mt={"-40px"}>
              If you select a future date the release will be scheduled.
            </Text>

            <CollapsableContainer
              title="Audio Files"
              subTitle="The selected audio file will be used for the episode, it will be the one that appears in the podcast feed and the one used for transcription."
              style={{ marginBottom: "40px" }}
              titleComponents={<Button onClick={onOpen}>Add Audio File</Button>}
            >
              <AudioFileSelector
                episode={fetchedEpisode}
                {...audioModalDisclosure}
              />
            </CollapsableContainer>
            <TranscriptionEdit
              episode={fetchedEpisode}
              control={control}
              errors={errors}
            />
            <ShowNotesEdit
              episode={fetchedEpisode}
              control={control}
              errors={errors}
            />
            {user && (
              <FormControlledImageUpload
                control={control}
                imageName={`${slugify(episodeTitle)}-image`}
                errors={errors}
                name="imageUrl"
                label="Episode Image"
                setValue={setValue}
                helperText="The image must be at least 1400 x 1400 pixels and at most 3000 x 3000 pixels, in JPEG or PNG format, and in the RGB color space with a minimum size of 500KB and a maximum size of 10MB."
                userId={user.id}
              />
            )}
            <FormControlledSwitch
              control={control}
              errors={errors}
              name="explicit"
              label="Does this episode have explicit content?"
            />
          </VStack>
        </form>
      </Flex>
      <ChatDrawer episode={fetchedEpisode} />
    </Box>
  );
};

export default EpisodesEditPage;

// http://localhost:3000/home/shows/edit/cll1ic1ln00009kqs94wcylx4
