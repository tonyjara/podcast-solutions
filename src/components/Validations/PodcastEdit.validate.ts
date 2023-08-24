import { type Podcast } from "@prisma/client";
import * as z from "zod";

export const validatePodcastEdit: z.ZodType<Podcast> = z.lazy(() =>
  z.object({
    id: z.string(),
    active: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    publishedAt: z.date({
      required_error: "Please select a date",
      invalid_type_error: "Please select a date",
    }),
    name: z.string().min(1, { message: "Podcast name is required" }).max(100),
    email: z.string().email({ message: "Invalid email address" }),
    author: z.string().min(1, { message: "Author name is required" }),
    slug: z.string().min(1, { message: "Slug is required" }),
    description: z
      .string()
      .min(1, { message: "Description is required" })
      .max(3900),
    categories: z.string().array().min(1, { message: "Category is required" }),
    language: z.string().min(1, { message: "Language is required" }),
    imageUrl: z
      .string()
      .min(1, { message: "Please upload an image for your podcast." }),
    explicit: z.boolean(),
    type: z.enum(["episodic", "serial"]),
  }),
);

export const defaultPodcastValues: Podcast = {
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "",
  email: "",
  author: "",
  slug: "",
  description: "",
  categories: [],
  language: "",
  imageUrl: "",
  explicit: false,
  active: true,
  publishedAt: null,
  type: "episodic",
};
