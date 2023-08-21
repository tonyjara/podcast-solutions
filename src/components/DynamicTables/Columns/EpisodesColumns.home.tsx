import { createColumnHelper } from "@tanstack/react-table";
import DateCell from "@/components/DynamicTables/DynamicCells/DateCell";
import TextCell from "@/components/DynamicTables/DynamicCells/TextCell";
import { Episode } from "@prisma/client";

const columnHelper = createColumnHelper<Episode>();

export const homeEpisodesColumns = ({
  pageIndex,
  pageSize,
}: {
  pageSize: number;
  pageIndex: number;
}) => [
  columnHelper.display({
    cell: (x) => x.row.index + 1 + pageIndex * pageSize,
    header: "N.",
  }),
  columnHelper.accessor("createdAt", {
    cell: (x) => <DateCell date={x.getValue()} />,
    header: "Fecha de Creación",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("title", {
    cell: (x) => <TextCell text={x.getValue()} />,
    header: "Episode Title",
    sortingFn: "text",
  }),
  //TODO add small audio player
  /* columnHelper.display({ */
  /*   cell: (x) => ( */
  /*     <TextCell */
  /*       text={ */
  /*         x.row.original.fantasyName?.length ? x.row.original.fantasyName : "-" */
  /*       } */
  /*     /> */
  /*   ), */
  /*   header: "N. de Fantasía", */
  /* }), */
];
