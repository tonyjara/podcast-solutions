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

  const shouldShowBanner =
    showBanner &&
    !!user &&
    mySubscription?.cancelAt &&
    isBefore(new Date(), mySubscription.cancelAt);

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
            Your subscription ends{" "}
            {format(mySubscription?.cancelAt ?? new Date(), "MM/dd/yy")}
          </Text>
          <Text hideFrom={"md"} fontWeight={"bold"}>
            Plan about to expire
          </Text>
          <Button
            as={Link}
            href={portalUrl}
            target="_blank"
            size={"sm"}
            colorScheme="green"
          >
            Renew
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
