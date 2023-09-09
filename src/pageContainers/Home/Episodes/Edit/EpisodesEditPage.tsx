import {
    Box,
    Button,
    Flex,
    VStack,
    useDisclosure,
    SimpleGrid,
    Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlledEditableText from "@/components/Forms/FormControlled/FormControlledEditable";
import FormControlledSwitch from "@/components/Forms/FormControlled/FormControlledSwitch";
import slugify from "slugify";
import { useSession } from "next-auth/react";
import { Episode } from "@prisma/client";
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
import FormControlledNumberInput from "@/components/Forms/FormControlled/FormControlledNumberInput";
import FormControlledSelect from "@/components/Forms/FormControlled/FormControlledSelect";
import useUnsavedChangesWarning from "@/lib/hooks/useUnsavedChangesWarning";

const EpisodesEditPage = ({ episode }: { episode: Episode }) => {
    const user = useSession().data?.user;
    const audioModalDisclosure = useDisclosure();
    const { onOpen } = audioModalDisclosure;

    const trpcContext = trpcClient.useContext();
    const {
        handleSubmit,
        control,
        setValue,
        getValues,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<Episode>({
        defaultValues: defaultEpisodeValues,
        resolver: zodResolver(validateEpisodeEdit),
    });
    useUnsavedChangesWarning(isDirty && !isSubmitting);

    const { mutate, isLoading } = trpcClient.episode.editEpisode.useMutation(
        handleUseMutationAlerts({
            successText: "Changes saved",
            callback: () => {
                trpcContext.invalidate();
            },
        }),
    );

    const { data: fetchedEpisode } =
        trpcClient.episode.getEpisodeWithAudioFiles.useQuery(
            { id: episode.id },
            { refetchOnWindowFocus: false },
        );

    useEffect(() => {
        if (!fetchedEpisode) return;
        reset(fetchedEpisode);

        return () => { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedEpisode]);

    const submitFunc = (data: Episode) => {
        mutate(data);
    };

    const episodeTitle = useWatch({ control, name: "title" });

    const someError = Object.keys(errors).length > 0;

    return (
        <Box
            p={{ base: 3, md: 10 }}
            w="100%"
            display={"flex"}
            justifyContent={"center"}
            pb={"100px"}
        >
            <Flex maxW={"1000px"} flexDir={"column"} gap={13}>
                <form
                    onKeyDown={(e) => {
                        e.key === "Enter" && e.preventDefault();
                    }}
                    onSubmit={handleSubmit(submitFunc)}
                    noValidate
                >
                    <Flex
                        justifyContent={{ base: "flex-start", sm: "space-between" }}
                        w="100%"
                        alignItems={{ base: "start", sm: "center" }}
                        gap={5}
                        mb={"40px"}
                        flexDir={{ base: "column", sm: "row" }}
                    >
                        <Flex w="full" gap={"20px"}>
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
                            >
                                {fetchedEpisode?.status === "published"
                                    ? "Publish Changes"
                                    : "Save"}
                            </Button>
                        </Flex>
                    </Flex>
                    {someError && (
                        <Text py={"10px"} color="red.300">
                            There's some issues in the form, please resolve them before
                            submitting.
                        </Text>
                    )}
                    <VStack spacing={8} alignItems={"flex-start"}>
                        <SimpleGrid
                            mb={"20px"}
                            columns={[1, 2, 3, 4]}
                            spacing={{ base: 5, md: 10 }}
                        >
                            <FormControlledDatePicker
                                control={control}
                                errors={errors}
                                name="releaseDate"
                                maxW={"200px"}
                                label="Release date"
                                helperText="Future dates schedule release."
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
                                episodeId={episode.id}
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

                        <CollapsableContainer
                            title="Episode Image"
                        /* tooltipText="The selected audio file will be used for the episode, it will be the one that appears in the podcast feed and the one used for transcription." */
                        >
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
                                    /* label="Episode Image" */
                                    setValue={setValue}
                                    helperText="The image must be at least 1400 x 1400 pixels and at most 3000 x 3000 pixels, in JPEG or PNG format, and in the RGB color space with a minimum size of 500KB and a maximum size of 10MB."
                                    userId={user.id}
                                    minW={1400}
                                />
                            )}
                        </CollapsableContainer>
                        <FormControlledSwitch
                            control={control}
                            errors={errors}
                            name="explicit"
                            label="Does this episode have explicit content?"
                        />
                    </VStack>
                </form>
            </Flex>
            <ChatDrawer
                setValue={setValue}
                getValues={getValues}
                episode={fetchedEpisode}
            />
        </Box>
    );
};

export default EpisodesEditPage;
