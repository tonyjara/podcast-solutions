import EpisodeNameForm from "@/components/Forms/EpisodeName.form";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react";
import React from "react";

const NewEpisodeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
        <ModalHeader>New Episode</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EpisodeNameForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewEpisodeModal;
