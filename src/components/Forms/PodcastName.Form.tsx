import FormControlledText from "@/components/Forms/FormControlled/FormControlledText"
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import {
    Input,
    Box,
    Button,
    Flex,
    Heading,
    Text,
    InputGroup,
    InputLeftAddon,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Podcast } from "@prisma/client"
import React from "react"
import { useForm, useWatch } from "react-hook-form"
import slugify from "slugify"
import { z } from "zod"

const validateName = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 character")
        .max(100, "Name must be less than 100 characters"),
})
interface props {
    goBack: () => void
    setCreatedPodcast: React.Dispatch<React.SetStateAction<Podcast | null>>
}

const PodcastNameForm = (props: props) => {
    const { setCreatedPodcast } = props
    const trpcContext = trpcClient.useContext()
    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<{ name: string }>({
        defaultValues: { name: "" },
        resolver: zodResolver(validateName),
    })
    const { mutate } = trpcClient.podcast.createPodcastWithName.useMutation(
        handleUseMutationAlerts({
            successText: "Podcast created",
            callback: (podcast) => {
                setCreatedPodcast(podcast)
                trpcContext.invalidate()
            },
        })
    )
    const submitFunc = async (data: { name: string }) => {
        mutate(data)
    }

    const name = useWatch({ control, name: "name" })

    return (
        <form onSubmit={handleSubmit(submitFunc)} noValidate>
            <Flex flexDir={"column"} gap={10}>
                <Heading fontSize={"3xl"}>
                    Pick a unique name that describes your podcast, you can
                    change this any time.
                </Heading>
                <FormControlledText
                    control={control}
                    errors={errors}
                    name="name"
                    label="Podcast Name"
                    autoFocus={true}
                />

                <Box>
                    <Text fontSize={"xl"}>
                        This is how your feed URL will look like:{" "}
                    </Text>
                    <Box>
                        <InputGroup my={2}>
                            <InputLeftAddon children="https://podcastsolutions.org/rss/" />
                            {/* <Input type='tel' placeholder='phone number' /> */}
                            <Input
                                readOnly
                                color={"green.500"}
                                pointerEvents={"none"}
                                value={`${slugify(name, { lower: true })}`}
                            />
                        </InputGroup>
                    </Box>
                    <Text color="red.300">
                        This url cannot be changed later.
                    </Text>
                </Box>
                <Flex justifyContent={"space-between"}>
                    <Button
                        onClick={props.goBack}
                        isLoading={isSubmitting}
                        size="lg"
                        alignSelf={"flex-end"}
                    >
                        Prev
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        size="lg"
                        alignSelf={"flex-end"}
                    >
                        Next
                    </Button>
                </Flex>
            </Flex>
        </form>
    )
}

export default PodcastNameForm
