import {
    FormControl,
    FormLabel,
    FormHelperText,
    FormErrorMessage,
} from "@chakra-ui/react"
import React, { useEffect, useRef } from "react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Controller } from "react-hook-form"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import type ReactQuill from "react-quill"

const QuillWrapper = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill")
        // eslint-disable-next-line react/display-name
        return ({ ...props }) => <RQ {...props} />
    },
    {
        ssr: false,
    }
) as typeof ReactQuill

interface InputProps<T extends FieldValues> {
    control: Control<T>
    errors: any
    name: Path<T>
    label?: string
    helperText?: string
    maxLength?: number
    hidden?: boolean
    autoFocus?: boolean
}

const FormControlledRichTextBlock = <T extends FieldValues>(
    props: InputProps<T>
) => {
    const { control, name, errors, label, helperText, hidden } = props

    const splitName = name.split(".")
    const reduceErrors = splitName.reduce((acc: any, curr: any) => {
        if (!acc[curr]) return acc
        if (isNaN(curr)) {
            return acc[curr]
        }
        return acc[parseInt(curr)]
    }, errors)

    /* const { quill, quillRef } = useQuill() */
    /* React.useEffect(() => { */
    /*     if (quill) { */
    /*         quill.on("text-change", (delta, oldDelta, source) => { */
    /*             console.log("Text change!") */
    /*             console.log(quill.getText()) // Get text only */
    /*             console.log(quill.getContents()) // Get delta contents */
    /*             console.log(quill.root.innerHTML) // Get innerHTML using quill */
    /*             console.log(quillRef.current.firstChild.innerHTML) // Get innerHTML using quillRef */
    /*         }) */
    /*     } */
    /* }, [quill]) */
    return (
        <FormControl hidden={hidden} isInvalid={!!reduceErrors.message}>
            {label && (
                <FormLabel fontSize={"md"} color={"gray.500"}>
                    {label}
                </FormLabel>
            )}
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <QuillWrapper
                        style={{
                            color: "black",
                        }}
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={{
                            clipboard: {
                                matchVisual: false,
                            },
                        }}
                    />
                )}
            />
            {!reduceErrors.message ? (
                <FormHelperText color={"gray.500"}>{helperText}</FormHelperText>
            ) : (
                <FormErrorMessage>{reduceErrors.message}</FormErrorMessage>
            )}
        </FormControl>
    )
}

export default FormControlledRichTextBlock
