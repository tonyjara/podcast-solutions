import * as z from "zod";

export interface SignupFormValues {
  email: string;
  firstName: string;
  lastName: string;
  reCaptchaToken: string;
  hasAgreedToTerms: boolean;
}

export const validateSignup: z.ZodType<SignupFormValues> = z
  .lazy(() =>
    z.object({
      email: z.string().email({ message: "Please enter a valid email" }),
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      reCaptchaToken: z.string(),
      hasAgreedToTerms: z.boolean(),
    }),
  )
  .superRefine(({ hasAgreedToTerms }, ctx) => {
    if (!hasAgreedToTerms) {
      ctx.addIssue({
        path: ["hasAgreedToTerms"],
        code: "custom",
        message: "You must agree to the terms and conditions",
      });
    }
  });

export const defaultSignupValues: SignupFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  reCaptchaToken: "",
  hasAgreedToTerms: false,
};
