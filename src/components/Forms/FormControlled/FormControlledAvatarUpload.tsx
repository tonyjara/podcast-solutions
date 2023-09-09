import {
  FormControl,
  VisuallyHidden,
  useColorModeValue,
  FormLabel,
  Spinner,
  Avatar,
  Box,
  AvatarBadge,
  IconButton,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type {
  Control,
  FieldValues,
  Path,
  SetFieldValue,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import axios from "axios";
import uploadFileToBlob from "@/lib/utils/azure-storage-blob";
import { myToast } from "@/components/Toasts & Alerts/MyToast";
import { compressAvatar } from "@/lib/utils/ImageCompressor";
import { EditIcon } from "@chakra-ui/icons";
interface InputProps<T extends FieldValues> {
  control: Control<T>;
  errors: any;
  urlName: Path<T>; // the url returned from azure
  label?: string;
  hidden?: boolean;
  setValue: SetFieldValue<T>;
  helperText?: string;
  userId: string;
}

const FormControlledAvatarUpload = <T extends FieldValues>(
  props: InputProps<T>,
) => {
  const { control, urlName, label, hidden, setValue, userId } = props;
  const [uploading, setUploading] = useState(false);
  const pictureUrl = useWatch({ control, name: urlName }) as string;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleImageUpload(acceptedFiles);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = async (files: File[]) => {
    try {
      if (!files[0]) return;
      setUploading(true);

      const getFile: File = files[0];
      //This way avatarurl is always the same
      const file = new File([getFile], "avatarUrl", {
        type: getFile.type,
        lastModified: getFile.lastModified,
      });
      const compressed = await compressAvatar(file);

      const req = await axios("/api/get-connection-string");
      const { connectionString } = req.data;

      const fileName = `${userId}-avatar.${compressed.type.split("/")[1]}`;
      const url = await uploadFileToBlob({
        fileName,
        file: compressed,
        containerName: userId,
        connectionString,
      });

      setValue(urlName, url);

      setUploading(false);
    } catch (err) {
      myToast.error();
      console.error(err);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
    },
  });
  const activeBg = useColorModeValue("gray.100", "gray.600");

  return (
    <FormControl px={6} py="5px" hidden={hidden}>
      <FormLabel fontSize={"md"} color={"gray.500"}>
        {label}
      </FormLabel>

      <Box
        display={uploading ? "none" : "block"}
        cursor={"pointer"}
        {...getRootProps()}
      >
        <Avatar
          src={pictureUrl?.length ? pictureUrl : undefined}
          width={100}
          height={100}
          _hover={{ bg: activeBg }}
          bg={isDragActive ? activeBg : "teal"}
        >
          <AvatarBadge
            as={IconButton}
            size="sm"
            rounded="full"
            aria-label="remove Image"
            icon={<EditIcon />}
          />
        </Avatar>
      </Box>
      {uploading && <Spinner size="xl" />}

      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
    </FormControl>
  );
};

export default FormControlledAvatarUpload;
