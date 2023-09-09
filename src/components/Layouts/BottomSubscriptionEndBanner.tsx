import { trpcClient } from "@/utils/api";
import { Box, Text, Flex, useColorModeValue, Button } from "@chakra-ui/react";
import { format, isBefore } from "date-fns";
import Link from "next/link";
import React from "react";
import { env } from "@/env.mjs";
import { useSession } from "next-auth/react";

const BottomSubscriptionEndBanner = () => {
  const user = useSession().data?.user;
  const [showBanner, setShowBanner] = React.useState(true);
  const { data: mySubscription } = trpcClient.users.getMySubsCription.useQuery(
    undefined,
    {
      enabled: !!user,
    },
  );

  const portalUrl = env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL;
  const newSubscriprionRoute = "/home/plans";

  const shouldShowBanner =
    showBanner &&
    !!user &&
    mySubscription?.cancellAt &&
    isBefore(new Date(), mySubscription.cancellAt);

  return (
    <Box
      display={shouldShowBanner ? "block" : "none"}
      position={"fixed"}
      backgroundColor={useColorModeValue("gray.200", "gray.700")}
      bottom={0}
      width={"100%"}
      p="0px"
      m="0px"
      height={"50px"}
    >
      {shouldShowBanner && (
        <Flex
          pt={"10px"}
          gap={"10px"}
          alignItems={"center"}
          justifyContent={"center"}
          alignContent={"center"}
        >
          {" "}
          <Text hideBelow={"md"} fontWeight={"bold"}>
            Your {mySubscription.isFreeTrial ? "trial" : "subscription"} ends{" "}
            {format(mySubscription?.cancellAt ?? new Date(), "MM/dd/yy")}
          </Text>
          <Text hideFrom={"md"} fontWeight={"bold"}>
            {mySubscription.isFreeTrial
              ? `Trial ends: ${format(
                  mySubscription?.cancellAt ?? new Date(),
                  "MM/dd/yy",
                )}`
              : "Plan about to expire"}
          </Text>
          <Button
            as={Link}
            href={mySubscription.isFreeTrial ? newSubscriprionRoute : portalUrl}
            target={mySubscription.isFreeTrial ? undefined : "_blank"}
            size={"sm"}
            colorScheme="green"
          >
            {mySubscription.isFreeTrial ? "Subscribe" : "Renew"}
          </Button>
          <Button onClick={() => setShowBanner(false)} size={"sm"}>
            Dismiss
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default BottomSubscriptionEndBanner;
