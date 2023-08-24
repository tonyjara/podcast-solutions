import {
  parseEpisodesAndAudioFilesFromFeed,
  parsePodcastFromFeed,
} from "@/server/api/routers/routeUtils/ParsePodcastFromFeed";
import "fast-text-encoding";
import { createId } from "@paralleldrive/cuid2";
import Parser from "rss-parser";

describe("test podcast feed parsing", () => {
  it("tests parsed feed", async () => {
    const feeds = [
      "https://media.rss.com/crimedivepodcast/feed.xml",
      "https://media.rss.com/thegroupchatlol/feed.xml",
      "https://feed.syntax.fm/rss",
    ];

    for await (const rssUrl of feeds) {
      const parser = new Parser();
      const feed = await parser.parseURL(rssUrl);

      expect(feed.title).not.toBeUndefined();

      const userId = createId();
      const parsedPodcast = parsePodcastFromFeed(feed, "test@test.com");

      expect(parsedPodcast.active).toBe(true);

      const episodesAndAudioFiles = parseEpisodesAndAudioFilesFromFeed(
        feed,
        parsedPodcast.id,
        userId,
      );
      const episodes = episodesAndAudioFiles.episodes;
      const audioFiles = episodesAndAudioFiles.audioFiles;

      expect(episodes.length).toEqual(feed.items.length);
      expect(audioFiles.length).toEqual(feed.items.length);
    }
  });
});
