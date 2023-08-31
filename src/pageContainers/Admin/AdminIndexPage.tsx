import DynamicTable from "@/components/DynamicTables/DynamicTable";
import { useDynamicTable } from "@/components/DynamicTables/UseDynamicTable";
import { trpcClient } from "@/utils/api";
import { adminLogsColumn } from "@/components/DynamicTables/Columns/AdminLogsColumn";

const AdminIndexPage = () => {
  const dynamicTableProps = useDynamicTable();

  const { data: logs } = trpcClient.logs.getLogs.useQuery();

  return (
    <div>
      <DynamicTable
        title={"Admin logs"}
        data={logs ?? []}
        columns={adminLogsColumn()}
        {...dynamicTableProps}
      />
    </div>
  );
};
export default AdminIndexPage;
