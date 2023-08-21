import {
  FormControl,
  FormHelperText,
  FormErrorMessage,
  Icon,
  VisuallyHidden,
  useColorModeValue,
  HStack,
  VStack,
  FormLabel,
  Flex,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { Path, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { AiOutlineCloudUpload } from "react-icons/ai";
import uploadFileToBlob from "@/lib/utils/azure-storage-blob";
import axios from "axios";
import { myToast } from "@/components/Toasts & Alerts/MyToast";
import slugify from "@sindresorhus/slugify";
import { AudioFile } from "@prisma/client";
interface InputProps {
  errors: any;
  fieldName: Path<AudioFile>;
  label: string;
  hidden?: boolean;
  setValue: UseFormSetValue<AudioFile>;
  getValues: UseFormGetValues<any>;
  helperText?: string;
  userId: string;
  episodeId: string;
  uploadCallback: () => void;
}

const FormControlledAudioUpload = (props: InputProps) => {
  const {
    fieldName,
    errors,
    label,
    hidden,
    setValue,
    helperText,
    userId,
    getValues,
    uploadCallback,
    episodeId,
  } = props;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleAudioUpload(acceptedFiles);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAudioUpload = async (files: File[]) => {
    try {
      if (!files[0]) return;
      setUploading(true);

      const audioName = getValues("name");
      const audioNameSlug = slugify(`${episodeId}-${audioName}-audio-file`);
      setValue("blobName", audioNameSlug);

      const getFile: File = files[0];
      const file = new File([getFile], audioNameSlug, {
        type: getFile.type,
        lastModified: getFile.lastModified,
      });
      const reader = new FileReader();
      // When the file has been succesfully read
      reader.onload = function (event) {
        if (!event.target) return;
        // Create an instance of AudioContext
        let audioContext = new window.AudioContext();

        // Asynchronously decode audio file data contained in an ArrayBuffer.
        audioContext.decodeAudioData(
          event.target.result as ArrayBuffer,
          function (buffer) {
            let duration = buffer.duration;
            setValue("duration", Math.floor(duration));
          },
        );
      };
      reader.readAsArrayBuffer(file);

      const req = await axios("/api/get-connection-string");
      const { connectionString } = req.data;
      const handleProgress = (progress: number) => {
        setProgress((progress / file.size) * 100);
      };

      const url = await uploadFileToBlob({
        file,
        containerName: userId,
        fileName: file.name,
        connectionString,
        onProgress: handleProgress,
      });
      if (!url) {
        throw new Error(
          "Something went wrong uploading your file, please try again.",
        );
      }

      setValue("url", url);
      setValue("length", file.size);
      setValue("type", file.type);
      setUploading(false);
      setProgress(0);
      uploadCallback();
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
      "audio/mpeg": [".mp3"],
    },
  });
  const activeBg = useColorModeValue("gray.100", "gray.600");

  const splitName = fieldName.split(".");
  const reduceErrors = splitName.reduce((acc: any, curr: any) => {
    if (!acc[curr]) return acc;
    if (isNaN(curr)) {
      return acc[curr];
    }
    return acc[parseInt(curr)];
  }, errors);

  return (
    <FormControl hidden={hidden} isInvalid={!!errors[fieldName]}>
      <FormLabel fontSize={"md"} color={"gray.500"}>
        {label}
      </FormLabel>
      <HStack justifyContent={"center"}>
        <VStack
          px={6}
          py="5px"
          borderWidth={2}
          _dark={{
            color: "gray.500",
          }}
          h="100px"
          w="100%"
          textAlign={"center"}
          borderStyle="dashed"
          rounded="md"
          transition="background-color 0.2s ease"
          _hover={{ bg: activeBg }}
          bg={isDragActive ? activeBg : "transparent"}
          {...getRootProps()}
        >
          <Flex color={"gray.400"}>
            {!uploading && "Drag and drop or click to upload"}
            {uploading && <span>Uploading, one moment please.</span>}
            {uploading && <Spinner ml={"10px"} />}
          </Flex>
          {!uploading && (
            <Icon h="50px" w="50px">
              <AiOutlineCloudUpload />
            </Icon>
          )}
          <VisuallyHidden>
            <input {...getInputProps()} />
          </VisuallyHidden>
        </VStack>
      </HStack>
      {uploading && (
        <Progress value={progress} width={"100%"} size={"lg"} mt={"10px"} />
      )}

      {!reduceErrors.message ? (
        <FormHelperText color={"gray.500"}>{helperText}</FormHelperText>
      ) : (
        <FormErrorMessage>{reduceErrors.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default FormControlledAudioUpload;
