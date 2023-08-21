import * as z from "zod";

export interface VerifyFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  linkId: string;
}

export const validateVerify: z.ZodType<VerifyFormValues> = z
  .lazy(() =>
    z.object({
      email: z.string().email({ message: "Please enter a valid email" }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      linkId: z.string().min(1, { message: "Last name is required" }),
    }),
  )
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });

export const defaultVerifyValues: VerifyFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  linkId: "",
};
