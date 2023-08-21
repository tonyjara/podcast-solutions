import { trpcClient } from "@/utils/api";
import { Select } from "chakra-react-select";
import React from "react";

const PodcastSelect = () => {
  const { data } = trpcClient.podcast.getMySelectedPodcast.useQuery();
  const { data: podcasts } = trpcClient.podcast.getMyPodcasts.useQuery();
  const podcastsOptions = podcasts?.map((opt) => ({
    value: opt.id,
    label: opt.name,
  }));

  return (
    <div style={{ width: "100%", maxWidth: "200px" }}>
      <Select
        options={podcastsOptions}
        onChange={(e) => {}}
        value={podcastsOptions?.find((x) => x.value === data?.id)}
        noOptionsMessage={() => "No options"}
        placeholder=""
        classNamePrefix="myDropDown"
        variant="flushed"
      />
    </div>
  );
};

export default PodcastSelect;
