import { decimalFormat } from "@/lib/utils/DecimalUtils";
import { prettyPriceTags } from "@/lib/utils/enumUtils";
import {
  Box,
  Heading,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { StripePriceTag } from "@prisma/client";
import Decimal from "decimal.js";
import React from "react";
import Stripe from "stripe";

export interface UsageStats {
  tag: StripePriceTag;
  credits: Decimal;
  data: Stripe.UsageRecordSummary[];
}

const UsageStats = ({
  myUsage,
  loading,
}: {
  myUsage: UsageStats[] | undefined;
  loading: boolean;
}) => {
  const borderColor = useColorModeValue("gray.800", "gray.500");
  return (
    <Box w="full" maxW={"800px"}>
      <Heading mb={"20px"} maxW={"7xl"}>
        My usage{" "}
      </Heading>
      <SimpleGrid columns={2} spacing={10}>
        {myUsage?.map((item: any) => {
          const value = item.data.reduce((acc: any, x: any) => {
            return (acc += x.total_usage);
          }, 0);

          return (
            item.tag !== "PLAN_FEE" &&
            item.tag !== "STORAGE_PER_GB" && (
              <Skeleton key={item.tag} isLoaded={!loading}>
                <Stat
                  px={{ base: 4, md: 8 }}
                  py={"5"}
                  shadow={"xl"}
                  border={"1px solid"}
                  borderColor={borderColor}
                  rounded={"lg"}
                >
                  <StatLabel>{prettyPriceTags(item.tag)}</StatLabel>
                  <StatNumber>
                    {" "}
                    Credits left: {decimalFormat(item.credits)}
                  </StatNumber>
                  <StatNumber> Used: {value}</StatNumber>
                </Stat>
              </Skeleton>
            )
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default UsageStats;
