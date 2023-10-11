import React, { useMemo, useRef } from "react"
import {
    Button,
    IconButton,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react"
import { BiSolidFlag } from "react-icons/bi"
import { UseFormSetValue } from "react-hook-form"
import { Episode } from "@prisma/client"
import { formatSecondsToDuration } from "@/lib/utils/durationUtils"

interface props {
    progressInSeconds: number
    setValue: UseFormSetValue<Episode>
    showNotes: string
}

const AddTimestampModal = ({
    progressInSeconds,
    setValue,
    showNotes,
}: props) => {
    const { isOpen, onClose, onOpen } = useDisclosure()

    const [text, setText] = React.useState("")
    const initialFocusRef = useRef(null)

    const handleClose = () => {
        setText("")
        onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoIzedProgress = useMemo(() => progressInSeconds, [isOpen])

    const handleAddMarker = () => {
        if (!text.length) return
        const prettyDuration = formatSecondsToDuration(memoIzedProgress)

        setValue(
            "showNotes",
            showNotes +
                `<ul><li><strong>(${prettyDuration})</strong> ${text}</li></ul>` +
                "\n"
        )

        handleClose()
    }

    return (
        <>
            <IconButton
                aria-label="Add timestamp"
                _hover={{ color: "brand.500" }}
                variant={"outline"}
                size={"sm"}
                icon={<BiSolidFlag style={{ fontSize: "16px" }} />}
                cursor={"pointer"}
                onClick={onOpen}
            />
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Name your timestamp</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <InputGroup>
                            <Input
                                ref={initialFocusRef}
                                autoFocus
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddMarker()
                                    }
                                }}
                            />
                        </InputGroup>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={handleAddMarker} size={"sm"}>
                            Add
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
export default AddTimestampModal
