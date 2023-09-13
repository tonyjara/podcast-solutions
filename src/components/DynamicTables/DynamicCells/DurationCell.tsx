import React from "react"
import { Text } from "@chakra-ui/react"
import { formatDurationSeconds } from "@/lib/utils/durationUtils"

interface props {
    value: number | undefined
}

const DurationCell = ({ value }: props) => {
    return (
        <Text fontSize="sm" fontWeight="bold">
            {value ? formatDurationSeconds(value) : "-"}
        </Text>
    )
}

export default DurationCell
