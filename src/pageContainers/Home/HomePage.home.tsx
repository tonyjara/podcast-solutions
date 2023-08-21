import DynamicTable from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import { Button, IconButton, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Episode } from "@prisma/client";
import NewEpisodeModal from "./NewEpisodeModal";
import { homeEpisodesColumns } from "@/components/DynamicTables/Columns/EpisodesColumns.home";
import { EditIcon } from "@chakra-ui/icons";
import NoPodcastAndPodcastEditModal from "./NoPodcastAndPodcastEditModal";

export default function HomePage() {
  const dynamicTableProps = useDynamicTable();
  const { pageIndex, pageSize } = dynamicTableProps;
  const router = useRouter();
  const {
    isOpen: isNewEpisodeOpen,
    onOpen: onNewEpisodeOpen,
    onClose: onNewEpisodeClose,
  } = useDisclosure();
  const NoPodcastAndEditToggles = useDisclosure();
  const { onOpen: onOpenNoPodcastAndPodcastEditModal } =
    NoPodcastAndEditToggles;

  const { data: selectedPodcast } =
    trpcClient.podcast.getMySelectedPodcast.useQuery();

  const handleRowClick = (row: Episode) => {
    return router.push(`home/episodes/edit/${row.id}`);
  };
  const handleSubtitleText = () => {
    if (!selectedPodcast) return "You have no podcast selected!";
    if (!selectedPodcast?.episodes.length) {
      return "You have no episodes! Click the shiny button!";
    }
    if (!selectedPodcast.active) {
      return "Your podcast is missing data to be published. Click the edit button to fix it!";
    }
    return undefined;
  };

  return (
    <div>
      <DynamicTable
        rowActions={handleRowClick}
        headerLeftComp={
          <IconButton
            aria-label="Edit podcast"
            onClick={onOpenNoPodcastAndPodcastEditModal}
            icon={<EditIcon />}
          />
        }
        headerRightComp={
          <Button
            onClick={onNewEpisodeOpen}
            className={selectedPodcast?.episodes.length ? undefined : "glow"}
          >
            Add new episode
          </Button>
        }
        subTitle={handleSubtitleText()}
        title={selectedPodcast?.name}
        data={selectedPodcast?.episodes ?? []}
        columns={homeEpisodesColumns({ pageIndex, pageSize })}
        {...dynamicTableProps}
      />
      <NoPodcastAndPodcastEditModal {...NoPodcastAndEditToggles} />
      <NewEpisodeModal isOpen={isNewEpisodeOpen} onClose={onNewEpisodeClose} />
    </div>
  );
}
