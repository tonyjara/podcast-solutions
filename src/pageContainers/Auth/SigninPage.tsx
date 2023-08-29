import { signIn } from "next-auth/react";
import {
  Box,
  SimpleGrid,
  GridItem,
  chakra,
  Flex,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const SigninPage = ({ providers }: any) => {
  return (
    <Box px={8} py={24} mx="auto">
      <SimpleGrid
        alignItems="center"
        w={{
          base: "full",
          xl: 11 / 12,
        }}
        columns={{
          base: 1,
          lg: 11,
        }}
        gap={{
          base: 0,
          lg: 24,
        }}
        mx="auto"
      >
        <GridItem
          colSpan={{
            base: "auto",
            lg: 7,
          }}
          textAlign={{
            base: "center",
            lg: "left",
          }}
        >
          <chakra.h1
            mb={4}
            fontSize={{
              base: "3xl",
              md: "4xl",
            }}
            fontWeight="bold"
            lineHeight={{
              base: "shorter",
              md: "none",
            }}
            color="gray.900"
            _dark={{
              color: "gray.200",
            }}
            letterSpacing={{
              base: "normal",
              md: "tight",
            }}
          >
            Podcast Solutions
          </chakra.h1>
          <chakra.p
            mb={{
              base: 10,
              md: 4,
            }}
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            fontWeight="thin"
            color="gray.500"
            letterSpacing="wider"
          >
            Join our ever growing platform of services for profesional and hobby
            poscasters. Streamline your podcasting experience.
          </chakra.p>
        </GridItem>
        <GridItem
          colSpan={{
            base: "auto",
            md: 4,
          }}
        >
          <Box as="form" mb={6} rounded="lg" shadow="xl">
            <Flex px={6} py={4} justifyContent={"center"}>
              {providers &&
                Object.values(providers).map((provider: any) => (
                  <Button
                    w={"full"}
                    maxW={"md"}
                    variant={"outline"}
                    leftIcon={<FcGoogle />}
                    key={provider.name}
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/home" })
                    }
                  >
                    Continue with {provider.name}
                  </Button>
                ))}
            </Flex>
          </Box>
          <chakra.p fontSize="xs" textAlign="center" color="gray.600">
            By signing up you agree to our{" "}
            <Link href={"/terms-of-service"}>
              <chakra.span color="brand.500">Terms of Service</chakra.span>
            </Link>
          </chakra.p>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};

export default SigninPage;
