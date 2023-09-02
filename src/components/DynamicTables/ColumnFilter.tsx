import { Button } from "@chakra-ui/react";
import { type Column } from "@tanstack/react-table";
import React from "react";
import EpisodeStatusColumnFilter from "./ColumnFilters/EpisodeStatusColumnFilter";
import InputContainsColumnFilter from "./ColumnFilters/InputContains.columnFilter";
import EpisodeReleaseDateColumnFilter from "./ColumnFilters/EpisodeReleaseDate.columnFilter";

export interface ColumnFilterProps {
  keyName?: string;
  column: Column<any>;
  whereFilterList: any[];
  setWhereFilterList?: React.Dispatch<React.SetStateAction<any[]>>;
}

/** 
This component lists filters that are specific to a column. They change the way the "where" query is executed inside prisma to give server filtering.
*/
const ColumnFilter = (props: ColumnFilterProps) => {
  const { column, setWhereFilterList, whereFilterList } = props;

  return (
    <div>
      {column.id === "episodeNumber" && (
        <Button
          size={"sm"}
          isDisabled={!whereFilterList.length}
          onClick={() => setWhereFilterList && setWhereFilterList([])}
        >
          Clear
        </Button>
      )}
      {column.id === "status" && <EpisodeStatusColumnFilter {...props} />}{" "}
      {column.id === "title" && (
        <InputContainsColumnFilter keyName="title" {...props} />
      )}{" "}
      {column.id === "releaseDate" && (
        <EpisodeReleaseDateColumnFilter keyName="releaseDate" {...props} />
      )}
    </div>
  );
};

export default ColumnFilter;
