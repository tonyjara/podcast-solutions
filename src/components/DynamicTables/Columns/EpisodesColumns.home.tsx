import { createColumnHelper } from "@tanstack/react-table";
import DateCell from "@/components/DynamicTables/DynamicCells/DateCell";
import TextCell from "@/components/DynamicTables/DynamicCells/TextCell";
import { Episode } from "@prisma/client";

const columnHelper = createColumnHelper<Episode>();

export const homeEpisodesColumns = () => [
  columnHelper.accessor("episodeNumber", {
    cell: (x) => `# ${x.getValue()}` ?? "-",
    header: "№",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("releaseDate", {
    cell: (x) =>
      x.getValue() ? <DateCell date={x.getValue() ?? new Date()} /> : "-",
    header: "Release Date",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("title", {
    cell: (x) => <TextCell text={x.getValue()} />,
    header: "Title",
    sortingFn: "text",
  }),

  columnHelper.accessor("status", {
    cell: (x) => <TextCell text={x.getValue()} />,
    header: "Status",
    sortingFn: "text",
  }),
  //TODO add small audio player
];
