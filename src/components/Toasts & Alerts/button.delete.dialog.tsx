import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import React from "react";

interface props {
  onConfirm: () => void;
  targetName: string;
  text?: string;
  buttonText: string;
}

export function ButtonDeleteDialog({
  onConfirm,
  targetName,
  text,
  buttonText,
}: props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const isAdmin = useSession().data?.user.role === "ADMIN";

  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <Button h="full" whiteSpace={"break-spaces"} onClick={onOpen}>
        {buttonText}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar {targetName}
            </AlertDialogHeader>

            <AlertDialogBody>
              {text ??
                `Estas seguro/a? ${
                  isAdmin ? "esta operación no se puede deshacer" : ""
                }`}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="red" onClick={handleDelete} mr={3}>
                Eliminar
              </Button>
              <Button ref={cancelRef} onClick={onClose}>
                Cerrar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
