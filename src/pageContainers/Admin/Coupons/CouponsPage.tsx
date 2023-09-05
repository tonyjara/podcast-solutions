import { couponsColumns } from "@/components/DynamicTables/Columns/CouponsColumns";
import DynamicTable from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import CreateCouponForm from "@/components/Forms/CreateCoupon.Form";
import { trpcClient } from "@/utils/api";
import { Box, Text, Button, Flex } from "@chakra-ui/react";
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
  return (
    <Box>
      <DynamicTable
        title="Coupons"
        whereFilterList={whereFilterList}
        setWhereFilterList={setWhereFilterList}
        headerComp={<CreateCouponForm />}
        columns={couponsColumns()}
        data={coupons ?? []}
        count={count}
        {...dynamicTableProps}
      />
    </Box>
  );
};

export default CouponsPage;
