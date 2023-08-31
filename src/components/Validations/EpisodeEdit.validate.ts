import { Episode, EpisodeStatus, EpisodeType } from "@prisma/client";
import * as z from "zod";

export const validateEpisodeEdit: z.ZodType<Episode> = z.lazy(() =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    releaseDate: z.date({ invalid_type_error: "Release Date is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    showNotes: z
      .string()
      .min(1, { message: "Show Notes are required" })
      .max(99999),
    transcription: z.string(),
    imageUrl: z.string().min(1, { message: "Image URL is required" }),
    explicit: z.boolean(),
    status: z.nativeEnum(EpisodeStatus),
    subscriptionId: z.string().min(1),
    podcastId: z.string(),
    selectedAudioFileId: z.string().nullable(),
    seasonNumber: z
      .number({ invalid_type_error: "Season number is required" })
      .min(1)
      .max(100),
    episodeNumber: z
      .number({ invalid_type_error: "Episode number is required" })
      .min(1)
      .max(999999),
    episodeType: z.nativeEnum(EpisodeType),
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
  status: "draft",
  subscriptionId: "",
  podcastId: "",
  releaseDate: null,
  selectedAudioFileId: null,
  seasonNumber: 1,
  episodeNumber: 1,
  episodeType: "full",
};
