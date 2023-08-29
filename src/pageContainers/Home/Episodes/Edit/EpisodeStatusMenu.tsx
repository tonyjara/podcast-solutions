import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { ChevronDownIcon, WarningIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { Episode } from "@prisma/client";
import React from "react";
import { BsArchive } from "react-icons/bs";
import { MdOutlinePublish, MdOutlineUnpublished } from "react-icons/md";

const EpisodeStatusMenu = ({
  episode,
  isDirty,
}: {
  episode: Episode;
  isDirty: boolean;
}) => {
  const episodeStatus = episode.status;
  const trpcContext = trpcClient.useContext();

  const { mutate: updateEpisodeStatus } =
    trpcClient.episode.updateEpisodeStatus.useMutation(
      handleUseMutationAlerts({
        successText: "Status updated",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );

  const handlePublishEpisode = () => {
    //TODO add publishing checks
    updateEpisodeStatus({ id: episode.id, status: "published" });
  };

  const handleUnpublishEpisode = () => {
    updateEpisodeStatus({ id: episode.id, status: "draft" });
  };

  const handleArchiveEpisode = () => {
    updateEpisodeStatus({ id: episode.id, status: "archived" });
  };

  return (
    <Menu>
      <MenuButton width={"100%"} as={Button} rightIcon={<ChevronDownIcon />}>
        {episodeStatus === "draft" && "Draft 🟠"}
        {episodeStatus === "published" && "Published 🟢"}
        {episodeStatus === "archived" && "Archived ⚫"}
      </MenuButton>{" "}
      <MenuList>
        {isDirty && (
          <MenuItem color="orange" icon={<WarningIcon />}>
            Please save to change the status
          </MenuItem>
        )}
        {episodeStatus === "draft" && (
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
  );
};

export default EpisodeStatusMenu;
