import CollapsableContainer from "@/components/CollapsableContainer"
import React from "react"
import { Control, FieldErrors } from "react-hook-form"
import FormControlledEditableText from "@/components/Forms/FormControlled/FormControlledEditable"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import FormControlledDatePicker from "@/components/Forms/FormControlled/FormControlledDatePicker"
import FormControlledNumberInput from "@/components/Forms/FormControlled/FormControlledNumberInput"
import FormControlledSelect from "@/components/Forms/FormControlled/FormControlledSelect"
import FormControlledSwitch from "@/components/Forms/FormControlled/FormControlledSwitch"
import { Episode } from "@prisma/client"

const EpisodeEditDetails = ({
    collapseAll,
    setCollapseAll,
    control,
    errors,
}: {
    collapseAll: boolean
    setCollapseAll: React.Dispatch<React.SetStateAction<boolean>>
    control: Control<Episode>
    errors: FieldErrors<Episode>
}) => {
    return (
        <CollapsableContainer
            collapseAll={collapseAll}
            setCollapseAll={setCollapseAll}
            title="Episode Details"
        >
            <Flex flexDir={"column"} gap={"20px"}>
                <FormControlledEditableText
                    control={control}
                    errors={errors}
                    name="title"
                />
                <SimpleGrid
                    columns={[1, 2, 3, 4]}
                    spacing={{ base: 5, md: 10 }}
                >
                    <FormControlledDatePicker
                        control={control}
                        errors={errors}
                        name="releaseDate"
                        maxW={"200px"}
                        label="Release date"
                        helperText="Future dates schedule release."
                    />
                    <FormControlledNumberInput
                        control={control}
                        errors={errors}
                        name="seasonNumber"
                        label="Season"
                    />

                    <FormControlledNumberInput
                        control={control}
                        errors={errors}
                        name="episodeNumber"
                        label="Number"
                    />

                    <FormControlledSelect
                        options={[
                            { label: "Full", value: "full" },
                            {
                                label: "Trailer",
                                value: "trailer",
                            },
                            { label: "Bonus", value: "bonus" },
                        ]}
                        control={control}
                        errors={errors}
                        name="episodeType"
                        label="Type"
                    />
                </SimpleGrid>

                <FormControlledSwitch
                    control={control}
                    errors={errors}
                    name="explicit"
                    label="Does this episode have explicit content?"
                />
            </Flex>
        </CollapsableContainer>
    )
}

export default EpisodeEditDetails
