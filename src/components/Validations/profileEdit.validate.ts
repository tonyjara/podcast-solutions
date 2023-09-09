import * as z from "zod";

export interface ProfileEditValues {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export const validateProfileEdit: z.ZodType<ProfileEditValues> = z.lazy(() =>
  z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    avatarUrl: z.string().min(1, { message: "Last name is required" }),
  }),
);

export const defaultProfileEditValues: ProfileEditValues = {
  firstName: "",
  lastName: "",
  avatarUrl: "",
};
