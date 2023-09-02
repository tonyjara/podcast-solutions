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
      /* "https://media.rss.com/crimedivepodcast/feed.xml", */
      /* "https://media.rss.com/thegroupchatlol/feed.xml", */
      /* "https://media.rss.com/thenbanextpodcast/feed.xml", */

      "https://feed.syntax.fm/rss", // one episode doesnt have enclosure
      /* "https://howtopodcast.us/feed/", */ //no enclosures
      /* "https://thepodcasthaven.com/feed/", also no enclosures */
    ];

    for await (const rssUrl of feeds) {
      const parser = new Parser();
      const feed = await parser.parseURL(rssUrl);

      expect(feed.title).not.toBeUndefined();

      const subscriptionId = createId();
      const parsedPodcast = parsePodcastFromFeed({
        feed,
        email: "test@test.com",
        subscriptionId,
      });

      expect(parsedPodcast.active).toBe(true);

      const episodesAndAudioFiles = parseEpisodesAndAudioFilesFromFeed({
        feed,
        podcastId: parsedPodcast.id,

        subscriptionId,
      });
      const episodes = episodesAndAudioFiles.episodes;
      const audioFiles = episodesAndAudioFiles.audioFiles;

      expect(episodes.length).toEqual(feed.items.length);
      expect(audioFiles.length).toEqual(feed.items.length);
    }
  });
});
