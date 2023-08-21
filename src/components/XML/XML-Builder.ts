// THIS IS FOR MANUALLY CREATING FEED
/* let rssFeedXML: any = { */
/*   rss: { */
/*     "@version": "2.0", */
/*     "@xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd", */
/*     "@xmlns:content": "http://purl.org/rss/1.0/modules/content/", */
/*     channel: { */
/*       title: podcast.name, */
/*       description: podcast.description, //max 4000 characters */
/*       "itunes:image": { "@href": podcast.imageUrl }, */
/*       /* Artwork must be a minimum size of 1400 x 1400 pixels and a maximum size of 3000 x 3000 pixels, in JPEG or PNG format, 72 dpi, with appropriate file extensions (.jpg, .png), and in the RGB colorspace. These requirements are different from the standard RSS image tag specifications. */
/*       language: podcast.language, */
/*       "itunes:category": { "@text": podcast.category }, */
/*       "itunes:explicit": podcast.explicit, */
/*       "itunes:author": podcast.author, */
/*       link: `${webUrl}/podcasts/${podcast.slug}`, */
/*       /* The website associated with a podcast. */
/*       /* Typically a home page for a podcast or a dedicated portion of a larger website. */
/*       "itunes:type": podcast.type, */
/*       //Episodic or Serial, episodic is the default, the latest release date comes first, serial is meant for when the podcast is intended to be consumed in a specific order */
/*       copyright: `Copyright ${podcast.author} ${new Date().getFullYear()}`, */
/*       /* "itunes:subtitle": podcastMetadata.itunes_subtitle, */
/*       "itunes:owner": { */
/*         "itunes:name": podcast.author, */
/*         "itunes:email": podcast.email, */
/*       }, */
/*       //Might add these later */
/*       /* "itunes:summary": podcastMetadata.itunes_summary, */
/*       /* "itunes:keywords": podcastMetadata.itunes_keywords, */
/*       // Tags that are interesting to know */
/*       /* "itunes:new-feed-url": // used when migrating feed */
/*       // "itunes:block": "Yes"  // Specifying the <itunes:block> tag with a Yes value, prevents the entire podcast from appearing in Apple Podcasts. */
/*       // "itunes:complete": "Yes" // Specifying the <itunes:complete> tag with a Yes value, indicates that the podcast is complete and no new episodes will be added. */
/*     }, */
/*   }, */
/* }; */
/**/

/* rssFeedXML.rss.channel.item = transfromedItems as any; */
/* let resultXML = xmlBuilder.end({ pretty: true }); */
/**/
/* const createiTunesPodcastItem = ( */
/*   episode: Episode & { */
/*     audioFiles: AudioFile[]; */
/*   }, */
/* ) => { */
/*   const audioFile = episode.audioFiles[0]; */
/*   if (!audioFile) throw new Error("No audio file found for episode"); */
/*   const contents = { */
/*     "itunes:title": episode.title, */
/*     enclosure: { */
/*       "@length": audioFile.length, // file size in bytes */
/*       "@type": audioFile.type, */
/*       "@url": audioFile.url, */
/*     }, */
/*     pubDate: episode.releaseDate, */
/*     description: episode.showNotes, // HTML should be converted to CDATA */
/*     "itunes:duration": audioFile.duration, // shoud be in seconds */
/*     "itunes:image": { "@href": episode.imageUrl }, //TODO make an option to use same as podcast */
/*     "itunes:explicit": episode.explicit, */
/*     //Situational, episode numbers are not required for type episodic but are required for type serial */
/*     "itunes:season": episode.seasonNumber, */
/*     "itunes:episode": episode.episodeNumber, */
/*     "itunes:episodeType": episode.episodeType, */
/*     // Add later maybe */
/*     // "link":  link to the episode page */
/*     // guid    uuid used by apple to identify the episode, you can use it to link from their platform to the feed */
/*   }; */
/**/
/*   return contents; */
/* }; */
