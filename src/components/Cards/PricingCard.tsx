import {
  Text,
  Box,
  Button,
  HStack,
  List,
  ListIcon,
  ListItem,
  VStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import React from "react";
import { FaCheckCircle, FaDollarSign } from "react-icons/fa";

interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  payAsYouGo: string[];
  description: string;
  popular?: boolean;
  handleCheckout: () => void;
  autenticated: boolean;
  subscriptionId?: string;
}

const PricingCard = ({
  description,
  payAsYouGo,
  popular,
  title,
  price,
  handleCheckout,
  features,
  autenticated,
}: PricingCardProps) => {
  /* const isSubscribedToThisPlan = subscriptionId && subscriptionId === ; */
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      <Box position={"relative"}>
        {popular && (
          <Box
            position="absolute"
            top="-16px"
            left="50%"
            style={{ transform: "translate(-50%)" }}
          >
            <Text
              textTransform="uppercase"
              /* bg={useColorModeValue("red.300", "red.700")} */
              bg="orange.300"
              px={3}
              py={1}
              /* color={useColorModeValue("gray.900", "gray.300")} */
              fontSize="sm"
              fontWeight="600"
              rounded="xl"
            >
              Most Popular
            </Text>
          </Box>
        )}

        {popular && (
          <Box
            position="absolute"
            top="-16px"
            left="50%"
            style={{ transform: "translate(-50%)" }}
          >
            <Text
              textTransform="uppercase"
              /* bg={useColorModeValue("red.300", "red.700")} */
              bg="orange.300"
              px={3}
              py={1}
              /* color={useColorModeValue("gray.900", "gray.300")} */
              fontSize="sm"
              fontWeight="600"
              rounded="xl"
            >
              Most Popular
            </Text>
          </Box>
        )}

        <Box py={4} px={12}>
          <Text fontWeight="500" fontSize="2xl">
            {title}
          </Text>
          <HStack justifyContent="center">
            <Text fontSize="3xl" fontWeight="600">
              $
            </Text>
            <Text fontSize="5xl" fontWeight="900">
              {price}
            </Text>
            <Text fontSize="3xl" color="gray.500">
              /month
            </Text>
          </HStack>
        </Box>
        <Box display={"flex"} justifyContent={"center"} w="100%">
          <Text mx={2} maxW={"300px"} mb={4}>
            {description}
          </Text>
        </Box>
        <VStack
          bg={useColorModeValue("gray.50", "gray.700")}
          py={4}
          borderBottomRadius={"xl"}
        >
          <List spacing={3} textAlign="start" px={12}>
            {features.map((x) => (
              <ListItem key={x}>
                <ListIcon as={FaCheckCircle} color="green.500" />
                {x}
              </ListItem>
            ))}
          </List>
          <Divider my="5px" />
          <Text fontWeight="500" fontSize="2xl" px={12}>
            Pay as you go
          </Text>
          <Text color={"gray.500"} fontWeight="500" fontSize="md" mb={"10px"}>
            After monthly quota is exceeded
          </Text>

          <List spacing={3} textAlign="start" px={12}>
            {payAsYouGo?.map((x) => (
              <ListItem key={x}>
                <ListIcon as={FaDollarSign} color="green.500" />
                {x}
              </ListItem>
            ))}
          </List>
          <Box w="80%" pt={7}>
            <Button
              onClick={handleCheckout}
              w="full"
              colorScheme="orange"
              variant="outline"
            >
              {autenticated ? "Subscribe" : "Sign up"}
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default PricingCard;
