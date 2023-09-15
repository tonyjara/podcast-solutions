import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
    Button,
    Heading,
    Icon,
    Text,
    Box,
    Stack,
    useColorModeValue,
    HStack,
    Flex,
    VStack,
} from "@chakra-ui/react"
import { SupportTicket } from "@prisma/client"
import Link from "next/link"
import React from "react"
import { FaPodcast, FaSpotify } from "react-icons/fa"
import { SiGooglepodcasts, SiStitcher, SiTunein } from "react-icons/si"
import {
    FormSupportTicket,
    defaultSupportTicketValues,
    validateSupportTicket,
} from "./Validations/supportTicket.validate"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import FormControlledText from "./Forms/FormControlled/FormControlledText"
import { useSession } from "next-auth/react"
import FormControlledAvatarUpload from "./Forms/FormControlled/FormControlledAvatarUpload"
import FormControlledFeedbackUpload from "./Forms/FormControlled/FormControlledFeedbackUpload"
import { trpcClient } from "@/utils/api"
import { handleUseMutationAlerts } from "./Toasts & Alerts/MyToast"

const SupportTicketModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) => {
    const user = useSession().data?.user
    const {
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormSupportTicket>({
        defaultValues: defaultSupportTicketValues,
        resolver: zodResolver(validateSupportTicket),
    })

    const handleClose = () => {
        reset()
        onClose()
    }

    const { mutate: submitTicket } =
        trpcClient.support.submitFeedback.useMutation(
            handleUseMutationAlerts({
                successText:
                    "Your feedback has been submited, you will be contacted shortly.",
                callback: () => {
                    handleClose()
                },
            })
        )

    const submitFunc = async (data: FormSupportTicket) => {
        submitTicket(data)
    }
    return (
        <Modal
            blockScrollOnMount={false}
            onClose={handleClose}
            size={"md"}
            isOpen={isOpen}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader ml={"10px"}>Feedback</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={"20px"}>
                    <form onSubmit={handleSubmit(submitFunc)} noValidate>
                        <Flex
                            gap={"20px"}
                            flexDir={"column"}
                            align={"start"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "2xl", sm: "2xl" }}>
                                We want to hear from you!
                            </Text>

                            <Text>
                                If you have any feedback, questions, or want to
                                report a bug, please fill out the form below.
                            </Text>
                            <Stack
                                spacing={8}
                                w={"full"}
                                maxW={"md"}
                                bg={useColorModeValue("white", "gray.700")}
                                alignItems={"center"}
                            >
                                <FormControlledText
                                    isRequired
                                    control={control}
                                    name="subject"
                                    label="Subject"
                                    errors={errors}
                                    helperText="What is your feedback about?"
                                />

                                <FormControlledText
                                    isRequired
                                    control={control}
                                    name="message"
                                    label="Message"
                                    errors={errors}
                                    helperText="Please describe your feedback in detail."
                                    isTextArea
                                />
                                {user && (
                                    <FormControlledFeedbackUpload
                                        control={control}
                                        errors={errors}
                                        urlName="imageUrl"
                                        imageName="imageName"
                                        setValue={setValue}
                                        userId={user?.id}
                                        helperText="Not required, but if you want to include a screenshot, you can upload it here."
                                    />
                                )}
                                <Button
                                    isDisabled={isSubmitting}
                                    onClick={handleSubmit(submitFunc)}
                                    w="full"
                                >
                                    Submit{" "}
                                </Button>
                            </Stack>
                        </Flex>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default SupportTicketModal