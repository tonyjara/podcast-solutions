import { AudioFile } from "@prisma/client";
import * as z from "zod";

export const vailidateAudioFile: z.ZodType<AudioFile> = z.lazy(() =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().min(1, { message: "Name is required" }),
    blobName: z.string().min(1, { message: "BlobName is required" }),
    url: z.string().min(1, { message: "URL is required" }),
    userId: z.string().min(1, { message: "UserId is required" }),
    episodeId: z.string().min(1, { message: "EpisodeId is required" }),
    isSelected: z.boolean(),
    length: z.number(),
    duration: z.number(),
    type: z.string().min(1, { message: "Type is required" }),
    podcastId: z.string().min(1, { message: "PodcastId is required" }),
  }),
);

export const defaultAudioFile: (props: {
  userId: string;
  episodeId: string;
  podcastId: string;
}) => AudioFile = ({ userId, episodeId, podcastId }) => ({
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "",
  blobName: "",
  url: "",
  userId,
  episodeId,
  isSelected: false,
  length: 0,
  duration: 0,
  type: "",
  podcastId,
});
