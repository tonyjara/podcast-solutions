import {
  Flex,
  Box,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
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
    <form onSubmit={handleSubmit(submitFunc)} noValidate>
      <Flex
        minH={"80vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack
          minW={{ base: "100%", md: "500px" }}
          spacing={8}
          mx={"auto"}
          maxW={"lg"}
          py={12}
          px={6}
        >
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Sign in</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
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
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Link href="/forgot-my-password">
                    <Text color={"blue.400"}>Forgot password?</Text>
                  </Link>
                </Stack>
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
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </form>
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
