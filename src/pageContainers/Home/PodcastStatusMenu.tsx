import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { isScheduled } from "@/lib/utils/dateUtils";
import { trpcClient } from "@/utils/api";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { Podcast } from "@prisma/client";
import React from "react";
import { BsArchive } from "react-icons/bs";
import { MdOutlinePublish, MdOutlineUnpublished } from "react-icons/md";

const PodcastStatusMenu = ({ podcast }: { podcast: Podcast }) => {
  const podcastStatus = podcast.podcastStatus;
  const trpcContext = trpcClient.useContext();

  const { mutate: changePodcastStatus, isLoading } =
    trpcClient.podcast.changePodcastStatus.useMutation(
      handleUseMutationAlerts({
        successText: "Podcast status updated",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );

  const podcastIsScheduled = isScheduled(podcast.publishedAt);
  return (
    <Menu>
      <MenuButton
        maxW={"170px"}
        width={"100%"}
        as={Button}
        rightIcon={<ChevronDownIcon />}
      >
        {podcastStatus === "published" && podcastIsScheduled && "Scheduled ⌛"}
        {podcastStatus === "published" && !podcastIsScheduled && "Published 🟢"}
        {podcastStatus === "unpublished" && "Unpublished 🟠"}
        {podcastStatus === "unlisted" && "Unlisted 🟣"}
        {podcastStatus === "private" && "Private 🔒"}
        {podcastStatus === "archived" && "Archived "}
      </MenuButton>{" "}
      <MenuList>
        {podcastStatus !== "published" && (
          <MenuItem
            onClick={() =>
              changePodcastStatus({
                podcastId: podcast.id,
                podcastStatus: "published",
              })
            }
            isDisabled={isLoading}
            icon={<MdOutlinePublish />}
          >
            Publish{" "}
          </MenuItem>
        )}

        {podcastStatus !== "unpublished" && (
          <MenuItem
            onClick={() =>
              changePodcastStatus({
                podcastId: podcast.id,
                podcastStatus: "unpublished",
              })
            }
            isDisabled={isLoading}
            icon={<MdOutlineUnpublished />}
          >
            Unpublish{" "}
          </MenuItem>
        )}
        {podcastStatus !== "archived" && (
          <MenuItem
            onClick={() =>
              changePodcastStatus({
                podcastId: podcast.id,
                podcastStatus: "archived",
              })
            }
            isDisabled={isLoading}
            icon={<BsArchive />}
          >
            Archive
          </MenuItem>
        )}

        {/* {episodeStatus === "archived" && ( */}
        {/*   <MenuItem */}
        {/*     onClick={handleUnpublishEpisode} */}
        {/*     isDisabled={isDirty} */}
        {/*     icon={<BsArchive />} */}
        {/*   > */}
        {/*     UnArchive */}
        {/*   </MenuItem> */}
        {/* )} */}
      </MenuList>
    </Menu>
  );
};

export default PodcastStatusMenu;
