import PodcastEditForm from "@/components/Forms/PodcastEdit.form"
import { Modal, ModalOverlay, ModalContent, ModalBody } from "@chakra-ui/react"
import { Podcast } from "@prisma/client"
import React from "react"

const PodcastEditModal = ({
    isOpen,
    onClose,
    selectedPodcast,
}: {
    isOpen: boolean
    onClose: () => void
    selectedPodcast: Podcast
}) => {
    return (
        <Modal
            blockScrollOnMount={false}
            onClose={onClose}
            size={"3xl"}
            isOpen={isOpen}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <PodcastEditForm
                        onClose={onClose}
                        podcast={selectedPodcast}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default PodcastEditModal
