import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    HStack,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import Link from "next/link";
import {
    type SignupFormValues,
    defaultSignupValues,
    validateSignup,
} from "@/components/Validations/signup.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import ReCAPTCHA from "react-google-recaptcha";
import FormControlledCheckbox from "@/components/Forms/FormControlled/FormControlledCheckbox";
import { trpcClient } from "@/utils/api";
import {
    handleUseMutationAlerts,
    myToast,
} from "@/components/Toasts & Alerts/MyToast";
import { getServerAuthSession } from "@/server/auth";
import { GetServerSideProps } from "next";

export default function SignupCard() {
    const [sent, setSent] = useState(false);
    const [sentAt, setSentAt] = useState<Date | null>(null);
    const recaptchaRef = useRef<any>(null);
    const siteKey = process.env.NEXT_PUBLIC_RE_CAPTCHA_SITE_KEY;
    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        defaultValues: defaultSignupValues,
        resolver: zodResolver(validateSignup),
    });
    const { mutate, isLoading } =
        trpcClient.magicLinks.generateVerificationLink.useMutation(
            handleUseMutationAlerts({
                successText: "Verification link sent",
                callback: async (data) => {
                    setSent(true);
                    setSentAt(data.sentAt);
                },
            }),
        );

    const submitFunc = async (data: SignupFormValues) => {
        mutate(data);
    };

    const handleSendAgain = () => {
        if (!sent || !sentAt) return;
        const now = new Date();
        const diff = now.getTime() - sentAt.getTime();
        if (diff < 5000) {
            myToast.error("Please wait a few seconds before sending again");
            return;
        }

        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        handleSubmit(submitFunc)();
        myToast.success("Verification link sent, please check your email");
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
                            Sign up
                        </Heading>
                    </Stack>
                    <Box
                        rounded={"lg"}
                        bg={useColorModeValue("white", "gray.700")}
                        boxShadow={"lg"}
                        p={8}
                    >
                        {sent && (
                            <Stack spacing={6}>
                                <Heading size={"md"}>
                                    We sent you a signup link, please check your email.
                                </Heading>
                                <Text alignSelf={"center"}>Did not receive the link?</Text>
                                <Button onClick={handleSendAgain}>Send again</Button>
                            </Stack>
                        )}

                        {!sent && (
                            <Stack spacing={4}>
                                <HStack>
                                    <FormControlledText
                                        isRequired
                                        control={control}
                                        name="firstName"
                                        label="First Name"
                                        errors={errors}
                                    />

                                    <FormControlledText
                                        isRequired
                                        control={control}
                                        name="lastName"
                                        label="Last Name"
                                        errors={errors}
                                    />
                                </HStack>
                                <FormControlledText
                                    isRequired
                                    control={control}
                                    name="email"
                                    label="Email address"
                                    errors={errors}
                                />

                                <Flex alignItems={"center"}>
                                    <FormControlledCheckbox
                                        control={control}
                                        name="hasAgreedToTerms"
                                        errors={errors}
                                        labelComponent={
                                            <FormLabel ml={"10px"}>
                                                I agree to Podcastsoluction's{" "}
                                                <Link href="/terms-of-service" target={"_blank"}>
                                                    <Text as={"span"} color={"blue.400"}>
                                                        Terms of Service
                                                    </Text>
                                                </Link>
                                            </FormLabel>
                                        }
                                    />
                                </Flex>

                                <FormControl isInvalid={!!errors.reCaptchaToken}>
                                    {siteKey && (
                                        <Controller
                                            control={control}
                                            name="reCaptchaToken"
                                            render={({ field }) => (
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    size="normal"
                                                    hl="es"
                                                    sitekey={siteKey}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    )}
                                    {errors.reCaptchaToken && (
                                        <FormErrorMessage>
                                            {errors?.reCaptchaToken?.message}
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
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
                                        Sign up
                                    </Button>
                                </Stack>
                                <Stack pt={6}>
                                    <Text align={"center"}>
                                        Already a user?{" "}
                                        <Link href={"/signin"}>
                                            <Text as={"span"} color={"blue.500"}>
                                                Login
                                            </Text>
                                        </Link>
                                    </Text>
                                </Stack>
                            </Stack>
                        )}
                    </Box>
                </Stack>
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
