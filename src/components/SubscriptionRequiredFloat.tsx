import { Text, Box, Flex, Icon } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { BiCrown } from "react-icons/bi";

const SubscriptionRequiredFloat = ({
  isFreeTrial,
}: {
  isFreeTrial: boolean;
}) => {
  return (
    <Box
      display={isFreeTrial ? "block" : "none"}
      backgroundColor={"yellow.100"}
      position={"fixed"}
      p="10px"
      top={"80px"}
      borderRadius={"md"}
      cursor={"pointer"}
      as={Link}
      href={"/home/plans"}
    >
      <Flex gap={"10px"} alignItems={"center"}>
        <Icon as={BiCrown} color={"black"} />
        <Text fontWeight={"xl"} color={"black"}>
          You require a subscription to activate this website, click here to
          start for <span style={{ fontWeight: "bold" }}>free!</span>{" "}
        </Text>
      </Flex>
    </Box>
  );
};

export default SubscriptionRequiredFloat;
