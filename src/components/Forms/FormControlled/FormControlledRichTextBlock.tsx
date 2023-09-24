import {
    FormControl,
    FormLabel,
    FormHelperText,
    FormErrorMessage,
} from "@chakra-ui/react"
import dynamic from "next/dynamic"
import React from "react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Controller } from "react-hook-form"
const QuillNoSSRWrapper = dynamic(import("react-quill"), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

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
                    <QuillNoSSRWrapper
                        style={{
                            color: "black",
                        }}
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
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
