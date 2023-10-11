import {
    Box,
    Button,
    Flex,
    VStack,
    useDisclosure,
    Text,
    useMediaQuery,
    IconButton,
} from "@chakra-ui/react"
import React from "react"
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { AddIcon } from "@chakra-ui/icons"
import { AiOutlineFundView } from "react-icons/ai"
import { useRouter } from "next/router"
import { BiCollapse } from "react-icons/bi"
import TimestampHandler from "@/components/AudioPlayer/TimestampHandler"
import { useLazyEffect } from "@/lib/hooks/useLazyEffect"
import { EpisodeForEditType } from "./EpisodeEdit.types"
import StickyEpisodeEditActions from "./StickyEpisodeEditActions"
import EpisodeEditWarnings from "./EpisodeEditWarnings"
import EpisodeEditDetails from "./EpisodeEditDetails"
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
                        {fetchedEpisode.audioFiles.some(
                            (x) => !x.isHostedByPS
                        ) && (
                            <EpisodeEditWarnings
                                audioFiles={fetchedEpisode.audioFiles}
                            />
                        )}

                        {/* INFO: Episode details */}

                        <EpisodeEditDetails
                            control={control}
                            errors={errors}
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                        />

                        {/* INFO: Audio selector */}

                        <AudioFileSelector
                            errors={errors}
                            episodeId={episode.id}
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            {...audioModalDisclosure}
                        />

                        {/* INFO: Transcription */}

                        <TranscriptionEdit
                            collapseAll={collapseAll}
                            setCollapseAll={setCollapseAll}
                            episode={fetchedEpisode}
                            control={control}
                            errors={errors}
                        />

                        {/* INFO: Timestamp tool  */}

                        <CollapsableContainer
                            collapseAll={collapseAll}
                            tooltipText={
                                "Double click to delete timestamps. Add timestamps pressing the flag icon on the audio player. You can also add timestams using the HH:MM, (HH:MM) or [HH:MM] format as long as it has a BOLD style. Ex: 00:12. Click on this icon to learn more."
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

                        {/* INFO: Show notes */}

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
