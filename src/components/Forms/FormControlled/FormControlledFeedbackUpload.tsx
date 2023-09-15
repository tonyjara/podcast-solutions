import {
    FormControl,
    VisuallyHidden,
    FormLabel,
    Spinner,
    Image,
    Box,
    Button,
    FormHelperText,
    FormErrorMessage,
} from "@chakra-ui/react"
import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import type { Control, FieldValues, Path, SetFieldValue } from "react-hook-form"
import { useWatch } from "react-hook-form"
import axios from "axios"
import uploadFileToBlob from "@/lib/utils/azure-storage-blob"
import { myToast } from "@/components/Toasts & Alerts/MyToast"
import { compressFeedbackImage } from "@/lib/utils/ImageCompressor"
interface InputProps<T extends FieldValues> {
    control: Control<T>
    errors: any
    urlName: Path<T> // the url returned from azure
    imageName: Path<T> // the url returned from azure
    label?: string
    hidden?: boolean
    setValue: SetFieldValue<T>
    userId: string
    helperText?: string
}

const FormControlledFeedbackUpload = <T extends FieldValues>(
    props: InputProps<T>
) => {
    const {
        imageName,
        errors,
        helperText,
        control,
        urlName,
        label,
        hidden,
        setValue,
        userId,
    } = props
    const [uploading, setUploading] = useState(false)
    const pictureUrl = useWatch({ control, name: urlName }) as string

    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleImageUpload(acceptedFiles)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleImageUpload = async (files: File[]) => {
        try {
            if (!files[0]) return
            setUploading(true)

            const getFile: File = files[0]
            const file = new File([getFile], "feedbackImage", {
                type: getFile.type,
                lastModified: getFile.lastModified,
            })
            const compressed = await compressFeedbackImage(file)
            const fileName = `${userId}-feedback-${new Date().valueOf()}.${
                compressed.type.split("/")[1]
            }`

            const req = await axios("/api/get-connection-string")
            const { connectionString } = req.data

            const url = await uploadFileToBlob({
                fileName,
                file: compressed,
                containerName: userId,
                connectionString,
            })

            setValue(urlName, url)
            setValue(imageName, fileName)

            setUploading(false)
        } catch (err) {
            myToast.error()
            console.error(err)
            setUploading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        multiple: false,
        accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        },
    })

    return (
        <FormControl py="5px" hidden={hidden}>
            <FormLabel fontSize={"md"} color={"gray.500"}>
                {label}
            </FormLabel>

            <Box
                display={pictureUrl ? "flex" : "none"}
                transition="background-color 0.2s ease"
                _hover={{ opacity: 0.5 }}
                opacity={isDragActive || uploading ? 0.5 : 1}
                {...getRootProps()}
                flexDir={"column"}
                alignItems={"center"}
            >
                <Image
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                    alt={"upload picture"}
                    src={pictureUrl?.length ? pictureUrl : "/no-image.png"}
                    width={100}
                    height={100}
                />
                {uploading && (
                    <Spinner mt={"-190px"} size={"xl"} mb={"145px"} />
                )}
                <VisuallyHidden>
                    <input disabled={uploading} {...getInputProps()} />
                </VisuallyHidden>
            </Box>
            {!pictureUrl && !uploading && (
                <Button {...getRootProps()}>Upload screenshot</Button>
            )}
            {uploading && <Spinner size="xl" />}
            {!pictureUrl &&
                !uploading &&
                (!errors[urlName]?.message ? (
                    <FormHelperText color={"gray.500"}>
                        {helperText}
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>
                        {errors[urlName].message}
                    </FormErrorMessage>
                ))}
        </FormControl>
    )
}

export default FormControlledFeedbackUpload
