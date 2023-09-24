import { Button, Flex, IconButton, useMediaQuery } from "@chakra-ui/react"
import { useRouter } from "next/router"
import React from "react"
import { EpisodeForEditType } from "./EpisodeEdit.types"
import { TbPlayerSkipBack, TbPlayerSkipForward } from "react-icons/tb"
import EpisodeStatusMenu from "./EpisodeStatusMenu"
import { DeleteIcon } from "@chakra-ui/icons"
import { AiTwotoneSave } from "react-icons/ai"
import { UseFormReset } from "react-hook-form"
import { Episode } from "@prisma/client"

interface props {
    fetchedEpisode: EpisodeForEditType | null
    nextEpisode: {
        id: string
    } | null
    prevEpisode: {
        id: string
    } | null
    isDirty: boolean
    isAnyButtonDisabled: boolean
    reset: UseFormReset<Episode>
    submitFunc: () => void
}

const StickyEpisodeEditActions = ({
    fetchedEpisode,
    prevEpisode,
    nextEpisode,
    isDirty,
    isAnyButtonDisabled,
    reset,
    submitFunc,
}: props) => {
    const router = useRouter()
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)")
    return (
        <Flex
            borderRadius={"md"}
            position={"sticky"}
            zIndex={10}
            top={{ base: "80px", md: "80px" }}
            gap={"10px"}
            outlineColor={"gray.700"}
            alignSelf={"flex-start"}
            justifyContent={"space-between"}
            height={"auto"}
        >
            <Flex gap={"10px"}>
                <IconButton
                    outline={"solid 3px"}
                    hideBelow={"sm"}
                    size={"sm"}
                    isDisabled={!prevEpisode}
                    onClick={() =>
                        router.push(`/home/episodes/edit/${prevEpisode?.id}`)
                    }
                    aria-label="Next Episode"
                    icon={<TbPlayerSkipBack fontSize={"sm"} />}
                />
                {fetchedEpisode && (
                    <EpisodeStatusMenu
                        episode={fetchedEpisode}
                        isDirty={isDirty}
                    />
                )}
            </Flex>
            <Flex gap={"10px"}>
                <Button
                    as={!isLargerThan800 ? IconButton : undefined}
                    outline={"solid 3px"}
                    icon={<DeleteIcon fontSize={"sm"} />}
                    size={"sm"}
                    rightIcon={<DeleteIcon fontSize={"sm"} />}
                    onClick={(e) => {
                        e.preventDefault()
                        if (!fetchedEpisode) return
                        reset(fetchedEpisode)
                    }}
                    isDisabled={isAnyButtonDisabled}
                >
                    {isLargerThan800 && "Discard"}
                </Button>
                <Button
                    as={!isLargerThan800 ? IconButton : undefined}
                    outline={"solid 3px"}
                    icon={<AiTwotoneSave fontSize={"sm"} />}
                    size={"sm"}
                    rightIcon={<AiTwotoneSave fontSize={"sm"} />}
                    onClick={submitFunc}
                    isDisabled={isAnyButtonDisabled}
                >
                    {isLargerThan800 &&
                        (fetchedEpisode?.status === "published"
                            ? "Publish Changes"
                            : "Save")}
                </Button>
                <IconButton
                    outline={"solid 3px"}
                    hideBelow={"sm"}
                    size={"sm"}
                    isDisabled={!nextEpisode || isAnyButtonDisabled}
                    onClick={() =>
                        router.push(`/home/episodes/edit/${nextEpisode?.id}`)
                    }
                    aria-label="Next Episode"
                    icon={<TbPlayerSkipForward fontSize={"sm"} />}
                />
            </Flex>
        </Flex>
    )
}

export default StickyEpisodeEditActions
