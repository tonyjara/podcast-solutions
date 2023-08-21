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
import { useSession } from 'next-auth/react';
import React from 'react';

interface props {
  onConfirm: () => void;
  targetName: string;
  text?: string;
}

export function RowOptionDeleteDialog({ onConfirm, targetName, text }: props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const isAdmin = useSession().data?.user.role === 'ADMIN';

  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* <Button colorScheme="red" onClick={onOpen}>
        Delete Customer
      </Button> */}
      <MenuItem onClick={onOpen}>Eliminar</MenuItem>

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
                  isAdmin ? 'esta operación no se puede deshacer' : ''
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
