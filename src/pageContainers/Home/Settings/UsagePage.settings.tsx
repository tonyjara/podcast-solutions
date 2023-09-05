import ClaimCouponsForm from "@/components/Forms/ClaimCoupons.form";
import SettingsLayout from "@/components/Layouts/SettingsLayout";
import UsageStats from "@/components/UsageStats";
import { trpcClient } from "@/utils/api";
import { Flex } from "@chakra-ui/react";
import React from "react";

const UsagePage = () => {
  const {
    data: myUsage,
    isLoading,
    isFetching,
  } = trpcClient.stripeUsage.getMyUsage.useQuery();
  return (
    <SettingsLayout>
      <Flex w="100%">
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <UsageStats
            myUsage={myUsage}
            loading={isLoading || isFetching || !myUsage?.length || !myUsage}
          />
          <ClaimCouponsForm />
        </Flex>
      </Flex>
    </SettingsLayout>
  );
};

export default UsagePage;
