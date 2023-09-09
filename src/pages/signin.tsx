import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  Link as ChakraLink,
  useColorModeValue,
} from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import { getServerAuthSession } from "@/server/auth";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { myToast } from "@/components/Toasts & Alerts/MyToast";
import router from "next/router";

interface SigninFormValues {
  email: string;
  password: string;
}
const validateSignin = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function SimpleCard() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(validateSignin),
  });

  const submitFunc = async ({ email, password }: SigninFormValues) => {
    const postSignin = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (postSignin?.error) {
      //handle
      console.error(postSignin.error);
      return myToast.error(
        "Error signing in, please check your credentials and try again",
      );
    }
    reset();
    router.push("/home");
  };
  return (
    <Flex
      minH={"90vh"}
      flexDir={"column"}
      align={"center"}
      justify={"start"}
      bg={useColorModeValue("gray.50", "gray.800")}
      w="full"
      px="20px"
    >
      <form
        /* style={{ width: "100%" }} */
        onSubmit={handleSubmit(submitFunc)}
        noValidate
      >
        <Stack spacing={8} py={{ base: 6, md: 12 }}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign in to Podcast Solutions
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={{ base: "none", md: "lg" }}
          p={5}
          minW={{ base: "full", md: "lg" }}
          maxW="xl"
        >
          <Stack spacing={8}>
            <FormControlledText
              isRequired
              control={control}
              name="email"
              label="Email"
              errors={errors}
            />

            <FormControlledText
              isRequired
              control={control}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              errors={errors}
              inputRight={
                <Button
                  variant={"ghost"}
                  onClick={() =>
                    setShowPassword((showPassword) => !showPassword)
                  }
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              }
            />
            <Button
              bg={"blue.400"}
              color={"white"}
              type="submit"
              isDisabled={isSubmitting}
              _hover={{
                bg: "blue.500",
              }}
            >
              Sign in
            </Button>
          </Stack>

          <Flex flexDir={"column"} pt="50px">
            <ChakraLink
              color="blue.400"
              as={Link}
              /* pb="10px" */
              href="/forgot-my-password"
            >
              Forgot your password?
            </ChakraLink>

            <ChakraLink mt="10px" color="blue.400" as={Link} href="/signup">
              Sign up for a free Podcast Solutions account
            </ChakraLink>
          </Flex>
        </Box>
      </form>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
