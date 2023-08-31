import { AudioFile } from "@prisma/client";
import * as z from "zod";

export const validateAudioFile: z.ZodType<AudioFile> = z.lazy(
  () =>
    z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      name: z.string().min(1, { message: "Name is required" }),
      blobName: z.string(),
      url: z.string().min(1, { message: "URL is required" }),
      subscriptionId: z
        .string()
        .min(1, { message: "Subscription id is required" }),
      episodeId: z.string().min(1, { message: "EpisodeId is required" }),
      isSelected: z.boolean(),
      length: z.number(),
      duration: z.number(),
      type: z.string().min(1, { message: "Type is required" }),
      podcastId: z.string().min(1, { message: "PodcastId is required" }),
      isHostedByPS: z.boolean(),
    }),
  //TODO add super redfine when isHostedByPS is true, to check for blobName
);

export const defaultAudioFile: (props: {
  subscriptionId: string;
  episodeId: string;
  podcastId: string;
}) => AudioFile = ({ subscriptionId, episodeId, podcastId }) => ({
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "",
  blobName: "",
  url: "",
  subscriptionId,
  episodeId,
  isSelected: false,
  length: 0,
  duration: 0,
  type: "",
  podcastId,
  isHostedByPS: false,
});
