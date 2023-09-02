import { isScheduled } from "@/lib/utils/dateUtils";
import { Prisma } from "@prisma/client";
import { Podcast as MakePodcast } from "podcast";

export type PodcastTypeForFeed = Prisma.PodcastGetPayload<{
  include: {
    episodes: { include: { audioFiles: { where: { isSelected: true } } } };
  };
}>;

export const generatePodcastRssFeed = async (podcast: PodcastTypeForFeed) => {
  if (!podcast.publishedAt) throw new Error("Podcast has no published date");

  //Channel tags enclose podcasts, for episodes, use item tags

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  if (!webUrl) throw new Error("NEXT_PUBLIC_WEB_URL env is not set");

  const feed = new MakePodcast({
    title: podcast.name,
    description: podcast.description,
    generator: "Podcast Solution's RSS Feed Generator 1.0",
    language: podcast.language,
    feedUrl: `${webUrl}/rss/${podcast.slug}`,
    siteUrl: `${webUrl}/podcasts/${podcast.slug}`,
    imageUrl: podcast.imageUrl,
    author: podcast.author,
    pubDate: podcast.publishedAt,
    copyright: `Copyright ${podcast.author} ${new Date().getFullYear()}`,
    itunesType: podcast.type,
    itunesCategory: podcast.categories.map((category) => ({ text: category })),
    itunesExplicit: podcast.explicit,
    itunesOwner: {
      name: podcast.author,
      email: podcast.email,
    },

    customElements: [
      {
        "podcast:locked": "no",
        "podcast:guid": podcast.slug,
      },
    ],
  });

  podcast.episodes.forEach((episode) => {
    const audioFile = episode.audioFiles.at(0);
    if (episode.releaseDate && !isScheduled(episode.releaseDate) && audioFile) {
      feed.addItem({
        title: episode.title,
        itunesTitle: episode.title,
        description: episode.showNotes,
        url: `${webUrl}/podcasts/${podcast.slug}/${episode.id}`, // link to the item

        guid: audioFile.url, // optional - defaults to url
        itunesKeywords: episode.keywords,
        /* author: "Guest Author", // optional - defaults to feed author property */
        date: episode.releaseDate, // any format that js Date can parse.
        /* lat: 33.417974, //optional latitude field for GeoRSS */
        /* long: -111.933231, //optional longitude field for GeoRSS */

        enclosure: {
          url: audioFile.url, // enclosure url requires an extension name
          size: audioFile.length,
          type: audioFile.type,
        }, // optional enclosure
        /* itunesAuthor: "Max Nowack", */
        itunesExplicit: episode.explicit,
        itunesEpisode: episode.episodeNumber ?? 1,
        itunesSeason: episode.seasonNumber ?? 1,
        /* itunesSubtitle: "I am a sub title", */
        /* itunesSummary: "I am a summary", */
        itunesDuration: audioFile.duration,
        /* itunesNewFeedUrl: "https://newlocation.com/example.rss", */
        customElements: [
          /* { "podcast:transcript": episode.transcription }, */ //Needs a url
          {
            "itunes:image": episode.imageUrl,
          },
        ],
      });
    }
  });

  return feed.buildXml();
};
