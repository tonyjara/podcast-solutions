import { createColumnHelper } from "@tanstack/react-table";
import DateCell from "@/components/DynamicTables/DynamicCells/DateCell";
import TextCell from "@/components/DynamicTables/DynamicCells/TextCell";
import { Episode, Logs } from "@prisma/client";
import MillisecondsCell from "../DynamicCells/MilliSecondsCell";

const columnHelper = createColumnHelper<Logs>();

export const adminLogsColumn = () => [
  /* columnHelper.accessor("episodeNumber", { */
  /*   cell: (x) => `# ${x.getValue()}` ?? "-", */
  /*   header: "№", */
  /*   sortingFn: "datetime", */
  /* }), */
  /* columnHelper.accessor("releaseDate", { */
  /*   cell: (x) => */
  /*     x.getValue() ? <DateCell date={x.getValue() ?? new Date()} /> : "-", */
  /*   header: "Release Date", */
  /*   sortingFn: "datetime", */
  /* }), */
  columnHelper.accessor("createdAt", {
    cell: (x) => <MillisecondsCell date={x.getValue()} />,
    header: "Created At",
    sortingFn: "datetime",
  }),

  columnHelper.accessor("level", {
    cell: (x) => <TextCell text={x.getValue() ?? "-"} />,
    header: "level",
    sortingFn: "text",
  }),
  columnHelper.accessor("message", {
    cell: (x) => <TextCell text={x.getValue()} />,
    header: "Message",
    sortingFn: "text",
  }),

  columnHelper.accessor("eventId", {
    cell: (x) => <TextCell text={x.getValue() ?? "-"} />,
    header: "Event Id",
    sortingFn: "text",
  }),

  /* columnHelper.accessor("status", { */
  /*   cell: (x) => <TextCell text={x.getValue()} />, */
  /*   header: "Status", */
  /*   sortingFn: "text", */
  /* }), */
  //TODO add small audio player
];
