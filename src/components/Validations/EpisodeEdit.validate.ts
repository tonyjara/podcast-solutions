import { Episode } from "@prisma/client";
import * as z from "zod";

export const validateEpisodeEdit: z.ZodType<Episode> = z.lazy(() =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    releaseDate: z.date(),
    title: z.string().min(1, { message: "Title is required" }),
    showNotes: z
      .string()
      .min(1, { message: "Show Notes is required" })
      .max(3990),
    transcription: z.string().min(1, { message: "Transcription is required" }),
    imageUrl: z.string().min(1, { message: "Image URL is required" }),
    explicit: z.boolean(),
    status: z.enum(["published", "draft"]),
    userId: z.string(),
    podcastId: z.string(),
    selectedAudioFileId: z.string().min(1),
    seasonNumber: z.number().nullable(),
    episodeNumber: z.number().nullable(),
    episodeType: z.enum(["full", "trailer", "bonus"]),
  }),
);

export const defaultEpisodeValues: Episode = {
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  title: "",
  showNotes: "",
  transcription: "",
  imageUrl: "",
  explicit: false,
  status: "published",
  userId: "",
  podcastId: "",
  releaseDate: null,
  selectedAudioFileId: null,
  seasonNumber: null,
  episodeNumber: null,
  episodeType: "full",
};
