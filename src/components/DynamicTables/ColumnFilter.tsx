import { Button } from "@chakra-ui/react";
import { type Column } from "@tanstack/react-table";
import React from "react";
import { BsFilter } from "react-icons/bs";

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
      {column.id === "N." && (
        <Button
          leftIcon={<BsFilter />}
          size={"sm"}
          isDisabled={!whereFilterList.length}
          onClick={() => setWhereFilterList && setWhereFilterList([])}
        >
          Borrar Filtros
        </Button>
      )}
      {/* {column.id === "status" && <MoneyRequestStatusColumnFilter {...props} />}{" "} */}
      {/* {column.id === "Proyecto" && ( */}
      {/*     <MoneyRequestProjectsColumnFilter {...props} /> */}
      {/* )}{" "} */}
      {/* {column.id === "moneyRequestType" && ( */}
      {/*     <MoneyRequestTypeColumnFilter {...props} /> */}
      {/* )}{" "} */}
      {/* {column.id === "description" && ( */}
      {/*     <InputContainsColumnFilter keyName="description" {...props} /> */}
      {/* )}{" "} */}
      {/* {column.id === "comments" && ( */}
      {/*     <InputContainsColumnFilter keyName="comments" {...props} /> */}
      {/* )}{" "} */}
      {/* {column.id === "createdAt" && <FromToDateColumnFilter {...props} />}{" "} */}
    </div>
  );
};

export default ColumnFilter;
