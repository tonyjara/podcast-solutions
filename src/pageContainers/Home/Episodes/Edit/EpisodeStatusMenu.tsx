import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast"
import { isScheduled } from "@/lib/utils/dateUtils"
import { trpcClient } from "@/utils/api"
import { ChevronDownIcon, WarningIcon } from "@chakra-ui/icons"
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react"
import React from "react"
import { BsArchive } from "react-icons/bs"
import { MdOutlinePublish, MdOutlineUnpublished } from "react-icons/md"
import { EpisodeForEditType } from "./EpisodeEdit.types"

const EpisodeStatusMenu = ({
    episode,
    isDirty,
}: {
    episode: EpisodeForEditType
    isDirty: boolean
}) => {
    const episodeStatus = episode.status
    const trpcContext = trpcClient.useContext()

    const { mutate: updateEpisodeStatus } =
        trpcClient.episode.updateEpisodeStatus.useMutation(
            handleUseMutationAlerts({
                successText: "Status updated",
                callback: () => {
                    trpcContext.invalidate()
                },
            })
        )

    const handlePublishEpisode = () => {
        //TODO add publishing checks
        updateEpisodeStatus({ id: episode.id, status: "published" })
    }

    const handleUnpublishEpisode = () => {
        updateEpisodeStatus({ id: episode.id, status: "draft" })
    }

    const handleArchiveEpisode = () => {
        updateEpisodeStatus({ id: episode.id, status: "archived" })
    }

    const episodeIsScheduled = isScheduled(episode.releaseDate)
    const someEpisodeIsNotInPsServers = episode.audioFiles.some(
        (x) => x.isHostedByPS === false
    )

    return (
        <Menu>
            <MenuButton
                maxW={"150px"}
                outline={"solid 3px"}
                width={"100%"}
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size={"sm"}
            >
                {episodeStatus === "published" &&
                    episodeIsScheduled &&
                    "Scheduled ⌛"}
                {episodeStatus === "published" &&
                    !episodeIsScheduled &&
                    "Published 🟢"}
                {episodeStatus === "draft" && "Draft 🟠"}
                {episodeStatus === "archived" && "Archived ⚫"}
            </MenuButton>{" "}
            <MenuList>
                {isDirty && (
                    <MenuItem color="orange" icon={<WarningIcon />}>
                        Please save to change the status
                    </MenuItem>
                )}

                {someEpisodeIsNotInPsServers && (
                    <MenuItem color="orange" icon={<WarningIcon />}>
                        Please resolve audio file issues before publishing
                    </MenuItem>
                )}
                {episodeStatus === "draft" && !someEpisodeIsNotInPsServers && (
                    <MenuItem
                        onClick={handlePublishEpisode}
                        isDisabled={isDirty}
                        icon={<MdOutlinePublish />}
                    >
                        Publish{" "}
                    </MenuItem>
                )}

                {episodeStatus === "published" && (
                    <MenuItem
                        onClick={handleUnpublishEpisode}
                        isDisabled={isDirty}
                        icon={<MdOutlineUnpublished />}
                    >
                        Unpublish{" "}
                    </MenuItem>
                )}
                {episodeStatus !== "archived" && (
                    <MenuItem
                        onClick={handleArchiveEpisode}
                        isDisabled={isDirty}
                        icon={<BsArchive />}
                    >
                        Archive
                    </MenuItem>
                )}

                {episodeStatus === "archived" && (
                    <MenuItem
                        onClick={handleUnpublishEpisode}
                        isDisabled={isDirty}
                        icon={<BsArchive />}
                    >
                        UnArchive
                    </MenuItem>
                )}
            </MenuList>
        </Menu>
    )
}

export default EpisodeStatusMenu
