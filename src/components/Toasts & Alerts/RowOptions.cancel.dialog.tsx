import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  MenuItem,
} from '@chakra-ui/react';
import React from 'react';

interface props {
  onConfirm: () => void;
  targetName: string;
  text?: string;
  isDisabled: boolean;
}

export function RowOptionCancelDialog({
  isDisabled,
  onConfirm,
  targetName,
  text,
}: props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <MenuItem isDisabled={isDisabled} onClick={onOpen}>
        Anular
      </MenuItem>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Anular {targetName}
            </AlertDialogHeader>

            <AlertDialogBody>
              {text ?? 'Estas seguro/a? esta operación no se puede deshacer'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="red" onClick={handleDelete} mr={3}>
                Anular
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
