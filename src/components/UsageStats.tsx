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
import Decimal from "decimal.js";
import React from "react";

const UsageStats = ({
  myUsage,
  loading,
}: {
  myUsage: any;
  loading: boolean;
}) => {
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
            <Skeleton key={item.tag} isLoaded={!loading}>
              <StatsCard
                title={item.tag}
                credits={item.credits}
                value={value}
              />
            </Skeleton>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default UsageStats;

const StatsCard = ({
  title,
  value,
  credits,
}: {
  title: string;
  value: string;
  credits?: Decimal;
}) => {
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <StatLabel>{prettyPriceTags(title)}</StatLabel>
      <StatNumber> Credits: {decimalFormat(credits)}</StatNumber>
      <StatNumber> Used: {value}</StatNumber>
    </Stat>
  );
};
