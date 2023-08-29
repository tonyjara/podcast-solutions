import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate";
import { validatePodcastEdit } from "@/components/Validations/PodcastEdit.validate";
import "fast-text-encoding";
import { createId } from "@paralleldrive/cuid2";
import { AudioFile, Episode, Podcast } from "@prisma/client";
import Parser from "rss-parser";
import slugify from "slugify";
import { validateAudioFile } from "@/components/Validations/Validate.AudioFile";

export type PodcastParserFeed = {
  [key: string]: any;
} & Parser.Output<{
  [key: string]: any;
}>;

export const parsePodcastFromFeed = (
  feed: PodcastParserFeed,
  email: string,
): Podcast => {
  /* delete feed.items; */
  /* console.log(feed); */
  const podcastId = createId();

  const podcastFromFeed: Podcast = {
    id: podcastId,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: feed.pubData ? new Date(feed.pubDate) : new Date(),
    name: feed.title ?? "",
    email: feed.itunes?.owner?.email ?? email,
    author: feed.itunes?.author ?? feed.title ?? "",
    slug: slugify(feed.title ?? "", { lower: true }),
    description: feed.description?.length ? feed.description : feed.title ?? "",
    categories: feed.itunes?.categories ?? ["Courses"],
    language: feed.language ?? "",
    imageUrl:
      feed.itunes?.image ??
      "https://res.cloudinary.com/tonyjara/image/upload/v1693264443/podcast-solutions/on2i87kict0sy7tictyl.jpg",
    explicit: feed.itunes?.explicit === "true" ? true : false,
    type: feed.itunes?.type ?? "episodic",
  };

  validatePodcastEdit.parse(podcastFromFeed);

  return podcastFromFeed;
};

export const parseEpisodesAndAudioFilesFromFeed = (
  feed: PodcastParserFeed,
  userId: string,
  podcastId: string,
): { episodes: Episode[]; audioFiles: AudioFile[] } => {
  /* console.log(feed.items[0]); */
  let episodes: Episode[] = [];

  let audioFiles: AudioFile[] = [];

  feed.items?.forEach((item, index) => {
    const episodeId = createId();
    const audioFileId = createId();
    const podcastEpisode: Episode = {
      id: episodeId,
      createdAt: new Date(),
      updatedAt: new Date(),
      releaseDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      title: item.title ?? "",
      showNotes: item.content ?? "",
      transcription: "",
      imageUrl: item.itunes?.image ?? "",
      explicit: item.itunes?.explicit === "true" ? true : false,
      status: "published",
      seasonNumber: item.itunes?.season ? parseInt(item.itunes.season) : 1,
      episodeNumber: item.itunes?.episode
        ? parseInt(item.itunes.episode)
        : index + 1,
      episodeType: item.itunes?.episodeType ?? "full",
      userId: userId,
      podcastId: podcastId,
      selectedAudioFileId: audioFileId,
    };

    const handleParseInt = (x: unknown) => {
      if (typeof x === "string") {
        return parseInt(x);
      }
      if (typeof x === "number") {
        return x;
      }
      return 0;
    };

    const episodeAudioFile: AudioFile = {
      id: audioFileId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: item.name ?? `audio-file-episode-${index + 1}`,
      length: handleParseInt(item.enclosure?.length),
      duration: handleParseInt(item.itunes?.duration),
      url: item.enclosure?.url ?? "",
      userId: userId,
      podcastId: podcastId,
      episodeId: episodeId,
      type: "audio/mpeg",
      blobName: audioFileId,
      isHostedByPS: false,
      isSelected: true,
    };
    const isValidEpisode = validateEpisodeEdit.safeParse(podcastEpisode);
    const isValidAudioFile = validateAudioFile.safeParse(episodeAudioFile);

    if (isValidEpisode.success && isValidAudioFile.success) {
      episodes.push(podcastEpisode);
      audioFiles.push(episodeAudioFile);
    }
    //TODO add error handling when validation fails
  });

  return { episodes, audioFiles };
};