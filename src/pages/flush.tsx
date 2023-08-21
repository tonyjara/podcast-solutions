import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Button } from "@chakra-ui/react";
import React from "react";

const flush = () => {
  const { mutate } = trpcClient.admin.flush.useMutation(
    handleUseMutationAlerts({
      successText: "Db was flushed",
    }),
  );
  return (
    <div>
      <Button onClick={() => mutate()}>FLUSH DB</Button>
    </div>
  );
};

export default flush;
