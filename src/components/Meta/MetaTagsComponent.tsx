import Head from "next/head";
import React from "react";
import FaviconLinks from "./FaviconLinks";
import { usePathname } from "next/navigation";

interface props {
  title?: string;
  description?: string;
  imageSrc?: string;
  date?: Date;
  id?: string;
}

const MetaTagsComponent = ({
  id,
  title,
  description,
  imageSrc,
  date,
}: props) => {
  const pathname = usePathname();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const WEB_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://podcastsolutions.org";

  const imageUrl = origin + (imageSrc ?? "/assets/meta/ps-cover.png");
  /* const imageUrl = imageSrc ?? origin + "/assets/meta/ps-cover.png"; */

  const metaKey = (key: string) => (id ? key + id : key);
  const metaDescription = (
    description ??
    "The simplest and easiest podcast hosting platform, schedule uploads, transcribe your audio, generate AI content and more. "
  ).substring(0, 150);

  const myTitle = title ?? "Podcast Solutions";
  const currentUrl = `${WEB_URL}${pathname}`;
  const domain = "https://podcastsolutions.org";
  const author = "Podcast Solutions";

  return (
    <Head>
      <link rel="canonical" href={currentUrl} key={metaKey("canonical")} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
        key={metaKey("viewport")}
      />

      <title key={metaKey("title")}>{myTitle}</title>

      <meta name="author" content={author} key={metaKey("author")} />
      <meta
        name="description"
        content={metaDescription}
        key={metaKey("description")}
      />
      <meta name="theme-color" content="#46AC42" />
      <meta
        name="image"
        property="og:image"
        content={imageUrl}
        key={metaKey("image")}
      />
      <meta property="og:image:alt" content={metaDescription} />

      {/* <!-- Facebook Meta Tags --> */}
      <meta
        name="url"
        property="og:url"
        content={currentUrl}
        key={metaKey("fb-url")}
      />
      <meta
        name="type"
        property="og:type"
        content="website"
        key={metaKey("fb-type")}
      />
      <meta
        name="title"
        property="og:title"
        content={myTitle}
        key={metaKey("fb-title")}
      />
      <meta
        name="description"
        property="og:description"
        content={metaDescription}
        key={metaKey("fb-description")}
      />

      {/* <!-- Twitter Meta Tags --> */}
      <meta
        name="twitter:card"
        content="summary_large_image"
        key={metaKey("twitter-card")}
      />
      <meta name="twitter:domain" content={domain} key={metaKey("domain")} />
      <meta
        name="twitter:url"
        content={currentUrl}
        key={metaKey("twitter-url")}
      />
      <meta
        name="twitter:title"
        content={myTitle}
        key={metaKey("twitter-title")}
      />
      <meta
        name="twitter:description"
        content={metaDescription}
        key={metaKey("twtitter-desc")}
      />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={metaDescription} />

      {/* <!-- LinkedIn Meta Tags --> */}
      <meta
        name="publish_date"
        property="og:publish_date"
        content={date?.toISOString() ?? new Date().toISOString()}
        key={metaKey("pubdate")}
      />

      <FaviconLinks />
    </Head>
  );
};

export default MetaTagsComponent;
