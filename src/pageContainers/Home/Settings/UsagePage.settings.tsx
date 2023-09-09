import ClaimCouponsForm from "@/components/Forms/ClaimCoupons.form";
import SettingsLayout from "@/components/Layouts/SettingsLayout";
import { decimalFormat } from "@/lib/utils/DecimalUtils";
import { prettyPriceTags } from "@/lib/utils/enumUtils";
import { trpcClient } from "@/utils/api";
import {
  Box,
  Text,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

const UsagePage = () => {
  const {
    data: myUsage,
    isLoading,
    isFetching,
  } = trpcClient.stripeUsage.getMyUsage.useQuery();

  const statBg = useColorModeValue("white", "gray.700");

  const loading = isLoading || isFetching || !myUsage?.length || !myUsage;

  return (
    <SettingsLayout>
      <Flex
        minH={"83vh"}
        w="100%"
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Flex w="100%" flexDirection="column" alignItems="center" pt={"20px"}>
          <Box w="full" maxW={"800px"}>
            <Heading mb={"10px"} maxW={"7xl"}>
              My usage{" "}
            </Heading>
            <Text color={"gray.500"} fontSize={"lg"} mb={"20px"}>
              Reported means you will get billed for that usage. As long as you
              have credits you will not get billed.
            </Text>
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
                        bg={statBg}
                        rounded={"lg"}
                      >
                        <StatLabel>{prettyPriceTags(item.tag)}</StatLabel>
                        <StatNumber>
                          {" "}
                          Credits left: {decimalFormat(item.credits)}
                        </StatNumber>
                        <StatNumber> Reported: {value}</StatNumber>
                      </Stat>
                    </Skeleton>
                  )
                );
              })}
            </SimpleGrid>
          </Box>
          <ClaimCouponsForm />
        </Flex>
      </Flex>
    </SettingsLayout>
  );
};

export default UsagePage;
