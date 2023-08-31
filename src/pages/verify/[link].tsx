import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import { getServerAuthSession } from "@/server/auth";
import { type GetServerSideProps } from "next";
import { trpcClient } from "@/utils/api";
import {
  handleUseMutationAlerts,
  myToast,
} from "@/components/Toasts & Alerts/MyToast";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { verifyToken } from "@/lib/utils/asyncJWT";
import { prisma } from "@/server/db";
import {
  VerifyFormValues,
  validateVerify,
} from "@/components/Validations/verify.validate";

export default function SignupCard(props: {
  data: { email: string; firstName: string; lastName: string; linkId: string };
}) {
  const {
    data: { email, firstName, lastName, linkId },
  } = props;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({
    defaultValues: {
      email,
      firstName,
      lastName,
      password: "",
      confirmPassword: "",
      linkId,
    },
    resolver: zodResolver(validateVerify),
  });
  const { mutate, isLoading } = trpcClient.auth.signup.useMutation(
    handleUseMutationAlerts({
      successText: "Account created successfully!",
      callback: async () => {
        const values = getValues();
        const x = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (!x?.error) {
          //redirect
          router.push("/home");
          reset();
        }

        if (x?.error) {
          console.error(x.error);
          myToast.error("Hubo un error favor intente nuevamente.");
        }
      },
    }),
  );

  const submitFunc = async (data: VerifyFormValues) => {
    mutate(data);
  };

  return (
    <Flex
      minH={"80vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <form onSubmit={handleSubmit(submitFunc)} noValidate>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"} textAlign={"center"}>
              {`Thanks for signing up, ${firstName}!`}
            </Heading>
            <Text fontSize={"xl"}>
              Please assign a password to your new account
            </Text>
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

              <FormControlledText
                isRequired
                control={control}
                name="confirmPassword"
                label="Confirm Password"
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

              <Stack spacing={10} pt={2}>
                <Button
                  isDisabled={isLoading || isSubmitting}
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type="submit"
                >
                  Create Account
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </form>
    </Flex>
  );
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });
  if (session?.user) {
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
    };
  }

  const token = ctx.query.link as string | null;
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) {
    return { notFound: true };
  }

  const verify = (await verifyToken(token, secret).catch((err) => {
    console.error("Verify err: " + JSON.stringify(err));
  })) as {
    data: { email: string; displayName: string; linkId: string };
  } | null;

  if (verify && "data" in verify) {
    const verifyLink = await prisma?.accountVerificationLinks.findUnique({
      where: { id: verify.data.linkId },
    });
    if (!verifyLink || verifyLink?.hasBeenUsed) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        data: verify.data,
        token,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
};
