import {
    Text,
    Box,
    Button,
    Flex,
    VStack,
    useDisclosure,
    SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlledEditableText from "@/components/Forms/FormControlled/FormControlledEditable";
import FormControlledSwitch from "@/components/Forms/FormControlled/FormControlledSwitch";
import slugify from "slugify";
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
import TranscriptionEdit from "./TranscriptionEdit";
import ChatDrawer from "@/components/ChatDrawer";
import ShowNotesEdit from "./ShowNotesEdit";
import FormControlledDatePicker from "@/components/Forms/FormControlled/FormControlledDatePicker";
import EpisodeStatusMenu from "./EpisodeStatusMenu";
import { AddIcon } from "@chakra-ui/icons";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import FormControlledNumberInput from "@/components/Forms/FormControlled/FormControlledNumberInput";
import FormControlledSelect from "@/components/Forms/FormControlled/FormControlledSelect";

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
        setFocus,
        formState: { errors, isSubmitting, isDirty },
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

        return () => { };
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
                        justifyContent={{ base: "flex-start", sm: "space-between" }}
                        w="100%"
                        alignItems={{ base: "start", sm: "center" }}
                        gap={5}
                        mb={"40px"}
                        flexDir={{ base: "column", sm: "row" }}
                    >
                        <Flex gap={"20px"}>
                            <FormControlledEditableText
                                control={control}
                                errors={errors}
                                name="title"
                            />
                            {fetchedEpisode && (
                                <EpisodeStatusMenu episode={fetchedEpisode} isDirty={isDirty} />
                            )}
                        </Flex>
                        <Flex gap={"20px"}>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!fetchedEpisode) return;
                                    reset(fetchedEpisode);
                                }}
                                isDisabled={isSubmitting || isLoading || !isDirty}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={() => handleSubmit(submitFunc)()}
                                isDisabled={isSubmitting || isLoading || !isDirty}
                                colorScheme="green"
                            >
                                {fetchedEpisode?.status === "published"
                                    ? "Publish Changes"
                                    : "Save"}
                            </Button>
                        </Flex>
                    </Flex>
                    <VStack alignItems={"flex-start"}>
                        <SimpleGrid columns={[1, 2, 3, 4]} spacing={10}>
                            <FormControlledDatePicker
                                control={control}
                                errors={errors}
                                name="releaseDate"
                                maxW={"200px"}
                                label="Release date"
                                helperText="Future dates schedule publishing."
                            />
                            <FormControlledNumberInput
                                control={control}
                                errors={errors}
                                name="seasonNumber"
                                label="Season Number"
                            />

                            <FormControlledNumberInput
                                control={control}
                                errors={errors}
                                name="episodeNumber"
                                label="Episode Number"
                            />

                            <FormControlledSelect
                                options={[
                                    { label: "Full", value: "full" },
                                    { label: "Trailer", value: "trailer" },
                                    { label: "Bonus", value: "bonus" },
                                ]}
                                control={control}
                                errors={errors}
                                name="episodeType"
                                label="Episode Type"
                            />
                        </SimpleGrid>

                        <CollapsableContainer
                            title="Audio Files"
                            tooltipText="The selected audio file will be used for the episode, it will be the one that appears in the podcast feed and the one used for transcription."
                            titleComponents={
                                <Button rightIcon={<AddIcon fontSize="sm" />} onClick={onOpen}>
                                    Add{" "}
                                </Button>
                            }
                        >
                            <AudioFileSelector
                                errors={errors}
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
                                imageName={
                                    episodeTitle
                                        ? `${(slugify(episodeTitle), { lower: true })}-image`
                                        : ""
                                }
                                errors={errors}
                                name="imageUrl"
                                label="Episode Image"
                                setValue={setValue}
                                helperText="The image must be at least 1400 x 1400 pixels and at most 3000 x 3000 pixels, in JPEG or PNG format, and in the RGB color space with a minimum size of 500KB and a maximum size of 10MB."
                                userId={user.id}
                                minW={1400}
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

// http://localhost:3000/home/
