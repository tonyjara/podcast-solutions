import { PodcastTypeForFeed } from "@/components/XML/ItunesFeedBuilder";
import React from "react";

const PodcastsPage = ({ podcast }: { podcast: PodcastTypeForFeed }) => {
  return <div>PodcastsPage {podcast.name}</div>;
};

export default PodcastsPage;
