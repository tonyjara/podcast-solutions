import React, { useRef, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  Container,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotMyPasswordPage() {
  const recaptchaRef = useRef<any>(null);
  const siteKey = process.env.NEXT_PUBLIC_RE_CAPTCHA_SITE_KEY;
  const [disableButton, setDisableButton] = useState(false);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; reCaptchaToken: string }>({
    defaultValues: { email: "", reCaptchaToken: "" },
    resolver: zodResolver(
      z.object({
        email: z.string().email("Enter a valid email address"),
        reCaptchaToken: z.string().min(1),
      }),
    ),
  });

  const { mutate, isLoading } =
    trpcClient.magicLinks.createLinkForPasswordRecovery.useMutation(
      handleUseMutationAlerts({
        successText:
          "An email has been sent to you with a link to reset your password.",
        callback: async () => {
          reset();

          setDisableButton(true);
          setTimeout(() => {
            setDisableButton(false);
          }, 5000);
        },
      }),
    );

  const submitFunc = async (data: {
    email: string;
    reCaptchaToken: string;
  }) => {
    mutate(data);
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(submitFunc)} noValidate>
        <Stack spacing={2}>
          <Heading
            textAlign={"center"}
            py={{ base: 0, md: 5 }}
            fontSize={{ base: "2xl", md: "4xl" }}
          >
            Forgot my password
          </Heading>

          <Box
            rounded={"lg"}
            bg={{
              base: "-moz-initial",
              md: useColorModeValue("white", "gray.700"),
            }}
            boxShadow={{ base: "none", md: "lg" }}
            p={5}
            minW={{ base: "full", md: "lg" }}
            maxW="xl"
          >
            <Stack spacing={5}>
              <FormControlledText
                label={"Email"}
                errors={errors}
                control={control}
                name="email"
                type="email"
                helperText={
                  "Please enter your email address to recover your password"
                }
              />

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
              <Button
                isDisabled={isSubmitting || isLoading || disableButton}
                type="submit"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Send email
              </Button>
            </Stack>
          </Box>
        </Stack>
      </form>
    </Container>
  );
}
