import PodcastEditForm from "@/components/Forms/PodcastEdit.form";
import PodcastNameForm from "@/components/Forms/PodcastName.Form";
import { trpcClient } from "@/utils/api";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";

const NoPodcastAndPodcastEditModal = ({
  isOpen,
  onClose,
  onOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) => {
  /* const { isOpen, onOpen, onClose } = useDisclosure(); */
  const { data, isLoading } = trpcClient.users.getMyPreferences.useQuery();
  const { data: podcasts } = trpcClient.podcast.getMyPodcasts.useQuery();
  useEffect(() => {
    if (podcasts?.length || isLoading || isOpen) return;
    if (!data || !data.hasSeenOnboarding || !podcasts?.length) {
      onOpen();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      blockScrollOnMount={false}
      /* scrollBehavior="outside" */
      /* closeOnOverlayClick={false} */
      onClose={onClose}
      size={"3xl"}
      isOpen={isOpen}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          {!podcasts?.length && <PodcastNameForm />}
          {podcasts && podcasts[0] && (
            <PodcastEditForm onClose={onClose} podcast={podcasts[0]} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NoPodcastAndPodcastEditModal;
