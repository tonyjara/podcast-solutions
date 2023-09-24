import {
    Box,
    Button,
    Flex,
    VStack,
    useDisclosure,
    SimpleGrid,
    Text,
    useMediaQuery,
    IconButton,
} from "@chakra-ui/react"
import React from "react"
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import FormControlledEditableText from "@/components/Forms/FormControlled/FormControlledEditable"
import FormControlledSwitch from "@/components/Forms/FormControlled/FormControlledSwitch"
import slugify from "slugify"
import { useSession } from "next-auth/react"
import { Episode } from "@prisma/client"
import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate"
import { useForm, useWatch } from "react-hook-form"
import FormControlledImageUpload from "@/components/Forms/FormControlled/FormControlledImageUpload"
import AudioFileSelector from "./AudioFileSelector"
import CollapsableContainer from "@/components/CollapsableContainer"
import TranscriptionEdit from "./TranscriptionEdit"
import ChatDrawer from "@/components/ChatDrawer"
import ShowNotesEdit from "./ShowNotesEdit"
import FormControlledDatePicker from "@/components/Forms/FormControlled/FormControlledDatePicker"
import { AddIcon } from "@chakra-ui/icons"
import FormControlledNumberInput from "@/components/Forms/FormControlled/FormControlledNumberInput"
import FormControlledSelect from "@/components/Forms/FormControlled/FormControlledSelect"
import { AiOutlineFundView } from "react-icons/ai"
import { useRouter } from "next/router"
import { BiCollapse } from "react-icons/bi"
import TimestampHandler from "@/components/AudioPlayer/TimestampHandler"
import { useLazyEffect } from "@/lib/hooks/useLazyEffect"
import { EpisodeForEditType } from "./EpisodeEdit.types"
import StickyEpisodeEditActions from "./StickyEpisodeEditActions"
import EpisodeEditWarnings from "./EpisodeEditWarnings"
/* import useUnsavedChangesWarning from "@/lib/hooks/useUnsavedChangesWarning"; */
interface EpisodeEditPageProps {
    episode: EpisodeForEditType
    nextEpisode: {
        id: string
    } | null
    prevEpisode: {
        id: string
    } | null
}

const EpisodesEditPage = ({
    episode,
    nextEpisode,
    prevEpisode,
}: EpisodeEditPageProps) => {
    const [collapseAll, setCollapseAll] = React.useState(false)
    const user = useSession().data?.user
    const router = useRouter()
    const audioModalDisclosure = useDisclosure()
    const { onOpen } = audioModalDisclosure

    const trpcContext = trpcClient.useContext()
    const {
        handleSubmit,
        control,
        setValue,
        getValues,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<Episode>({
        defaultValues: episode,
        resolver: zodResolver(validateEpisodeEdit),
    })

    const { mutate, isLoading } = trpcClient.episode.editEpisode.useMutation(
        handleUseMutationAlerts({
            successText: "Changes saved",
            callback: () => {
                trpcContext.invalidate()
            },
        })
    )

    const { data: fetchedEpisode, isFetchedAfterMount } =
        trpcClient.episode.getEpisodeForEditPage.useQuery(
            { id: episode.id },
            {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                initialData: episode,
            }
        )

    useLazyEffect(() => {
        //Guarantees that the default data is from the getServerside props comp
        if (!isFetchedAfterMount) return
        reset(fetchedEpisode)

        return () => {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedEpisode, isFetchedAfterMount])

    const submitFunc = (data: Episode) => {
        mutate(data)
    }

    const episodeTitle = useWatch({ control, name: "title" })
    const showNotes = useWatch({ control, name: "showNotes" })
    const someError = Object.keys(errors).length > 0
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)")

    return (
        <Box
            p={{ base: 3, md: 10 }}
            w="full"
            display={"flex"}
            flexDir={"row"}
            justifyContent={"center"}
            pb={"100px"}
        >
            <Flex maxW={"1000px"} w="full" flexDir={"column"} gap={13}>
                <form
                    onKeyDown={(e) => {
                        e.key === "Enter" && e.preventDefault()
                    }}
                    onSubmit={handleSubmit(submitFunc)}
                    noValidate
                >
                    {/* INFO: Sticky actions bar  */}
                    <StickyEpisodeEditActions
                        fetchedEpisode={fetchedEpisode}
                        isDirty={isDirty}
                        prevEpisode={prevEpisode}
                        nextEpisode={nextEpisode}
                        reset={reset}
                        isAnyButtonDisabled={
                            isSubmitting || isLoading || !isDirty
                        }
                        submitFunc={() => handleSubmit(submitFunc)()}
                    />

                    {/* INFO: Secondary actions */}
                    <Flex
                        justifyContent={"space-between"}
                        mt={"20px"}
                        gap={"10px"}
                    >
                        <Button
                            as={!isLargerThan800 ? IconButton : undefined}
                            icon={<BiCollapse />}
                            size={"sm"}
                            leftIcon={<BiCollapse />}
                            onClick={() => setCollapseAll(true)}
                        >
                            {isLargerThan800 && "Collapse all"}
                        </Button>
                        <Button
                            as={!isLargerThan800 ? IconButton : undefined}
                            icon={<AiOutlineFundView />}
                            size={"sm"}
                            onClick={() =>
                                router.push(
                                    `/podcasts/${fetchedEpisode?.podcast.slug}/${episode.id}`
                                )
                            }
                            rightIcon={<AiOutlineFundView fontSize={"sm"} />}
                        >
                            {isLargerThan800 && "Preview"}
                        </Button>
                    </Flex>
                    <VStack mt={"20px"} spacing={8} alignItems={"flex-start"}>
                        {someError && (
                            <Text py={"10px"} color="red.300">
                                There's some issues in the form, please resolve
                                them before submitting.
                            </Text>
                        )}
                        {/* INFO: Episode warnings and info */}
                        <EpisodeEditWarnings
                            audioFiles={fetchedEpisode.audioFiles}
                        />

                        {/* INFO: Episode details */}
                        <CollapsableContainer
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            title="Episode Details"
                        >
                            <Flex flexDir={"column"} gap={"20px"}>
                                <FormControlledEditableText
                                    control={control}
                                    errors={errors}
                                    name="title"
                                />
                                <SimpleGrid
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
                                        label="Season"
                                    />

                                    <FormControlledNumberInput
                                        control={control}
                                        errors={errors}
                                        name="episodeNumber"
                                        label="Number"
                                    />

                                    <FormControlledSelect
                                        options={[
                                            { label: "Full", value: "full" },
                                            {
                                                label: "Trailer",
                                                value: "trailer",
                                            },
                                            { label: "Bonus", value: "bonus" },
                                        ]}
                                        control={control}
                                        errors={errors}
                                        name="episodeType"
                                        label="Type"
                                    />
                                </SimpleGrid>

                                <FormControlledSwitch
                                    control={control}
                                    errors={errors}
                                    name="explicit"
                                    label="Does this episode have explicit content?"
                                />
                            </Flex>
                        </CollapsableContainer>
                        {/* INFO: Audio selector */}
                        <CollapsableContainer
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            title="Audio Files"
                            tooltipText="The selected audio file will be used for the episode, it will be the one that appears in the podcast feed and the one used for transcription."
                            titleComponents={
                                <Button
                                    size={"sm"}
                                    rightIcon={<AddIcon fontSize="sm" />}
                                    onClick={onOpen}
                                >
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
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            episode={fetchedEpisode}
                            control={control}
                            errors={errors}
                            hasAudioFiles={!!fetchedEpisode.audioFiles.length}
                        />
                        {/* INFO: Timestamp tool  */}
                        <CollapsableContainer
                            collapseAll={collapseAll}
                            tooltipText={
                                "Add timestamps using the flag icon at the cursos position. Adjust the time by dragging the timestamp text or arrow. Double clck a timestamp to delete it. Add manually by making a list in the show notes, writing your time in the following format hh:mm and creating a link. Then edit the link with this format #t=YOUR_TIME ex: #t=30:01"
                            }
                            setCollapseAll={setCollapseAll}
                            title="Timestamp tool"
                        >
                            <TimestampHandler
                                getValues={getValues}
                                setValue={setValue}
                                showNotes={showNotes}
                                episodeId={episode.id}
                            />
                        </CollapsableContainer>
                        <ShowNotesEdit
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            episode={fetchedEpisode}
                            control={control}
                            errors={errors}
                        />
                        {/* INFO:Episode Image */}
                        <CollapsableContainer
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            title="Episode Image"
                        >
                            {user && (
                                <FormControlledImageUpload
                                    control={control}
                                    imageName={
                                        episodeTitle
                                            ? `${
                                                  (slugify(episodeTitle),
                                                  { lower: true })
                                              }-image`
                                            : ""
                                    }
                                    errors={errors}
                                    name="imageUrl"
                                    setValue={setValue}
                                    helperText="The image must be at least 1400 x 1400 pixels and at most 3000 x 3000 pixels, in JPEG or PNG format, and in the RGB color space with a minimum size of 500KB and a maximum size of 10MB."
                                    userId={user.id}
                                    minW={1400}
                                />
                            )}
                        </CollapsableContainer>
                    </VStack>
                </form>
            </Flex>
            <ChatDrawer
                setValue={setValue}
                getValues={getValues}
                episode={fetchedEpisode}
            />
        </Box>
    )
}

export default EpisodesEditPage
