import { couponsColumns } from "@/components/DynamicTables/Columns/CouponsColumns";
import { CouponsRowOptions } from "@/components/DynamicTables/Columns/RowOptions/CouponRowOptions";
import DynamicTable, {
  RowOptionsType,
} from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import CreateCouponForm from "@/components/Forms/CreateCoupon.Form";
import { trpcClient } from "@/utils/api";
import { Box } from "@chakra-ui/react";
import { Prisma } from "@prisma/client";
import React, { useState } from "react";

const CouponsPage = () => {
  const dynamicTableProps = useDynamicTable();
  const { pageIndex, pageSize, sorting } = dynamicTableProps;
  const [whereFilterList, setWhereFilterList] = useState<
    Prisma.CouponsScalarWhereInput[]
  >([]);

  const { data: coupons, isLoading } = trpcClient.admin.getCoupons.useQuery({
    pageSize,
    pageIndex,
    sorting,
    whereFilterList,
  });

  const { data: count } = trpcClient.admin.countCoupons.useQuery({
    whereFilterList,
  });
  const rowOptionsFunction: RowOptionsType = ({ x, setMenuData }) => {
    return (
      <CouponsRowOptions
        x={x}
        /* onExpReturnOpen={onExpenseReturnOpen} */
        setMenuData={setMenuData}
      />
    );
  };

  return (
    <Box>
      <DynamicTable
        title="Coupons"
        loading={isLoading}
        whereFilterList={whereFilterList}
        setWhereFilterList={setWhereFilterList}
        headerComp={<CreateCouponForm />}
        columns={couponsColumns({ pageIndex, pageSize })}
        rowOptions={rowOptionsFunction}
        data={coupons ?? []}
        count={count}
        {...dynamicTableProps}
      />
    </Box>
  );
};

export default CouponsPage;
