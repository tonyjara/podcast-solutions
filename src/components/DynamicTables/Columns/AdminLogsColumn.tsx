import { createColumnHelper } from "@tanstack/react-table";
import TextCell from "@/components/DynamicTables/DynamicCells/TextCell";
import { Logs } from "@prisma/client";
import MillisecondsCell from "../DynamicCells/MilliSecondsCell";

const columnHelper = createColumnHelper<Logs>();

export const adminLogsColumn = () => [
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
];
