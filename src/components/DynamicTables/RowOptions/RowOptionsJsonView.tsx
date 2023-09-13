import {
    useDisclosure,
    MenuItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react"
import React from "react"
import dynamic from "next/dynamic"
const JsonView = dynamic(() => import("react-json-view"), { ssr: false })

interface props {
    x: any
}

export function RowOptionsJsonView({ x }: props) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <div>
            <MenuItem onClick={onOpen}>View JSON Object</MenuItem>

            <Modal size={"4xl"} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{x?.id ?? ""}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody minW={"xl"}>
                        <JsonView src={x} theme="monokai" />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    )
}
