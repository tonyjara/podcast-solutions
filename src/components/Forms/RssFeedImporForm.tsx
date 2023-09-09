import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import {
  handleUseMutationAlerts,
  myToast,
} from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import PodcastImportCard from "../Cards/PodcastImporCard";

const validateFeedUrl = z.object({
  rssFeedUrl: z.string().url().min(1),
});
interface props {
  goBack: () => void;
}

const RssImportForm = (props: props) => {
  const [importedFeed, setImportedFeed] = useState<any | null>(null);
  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<{ rssFeedUrl: string }>({
    defaultValues: { rssFeedUrl: "" },
    resolver: zodResolver(validateFeedUrl),
  });
  const { mutate, isLoading: isLoadingFeed } =
    trpcClient.rss.parseFeedUrl.useMutation({
      onSuccess: (data) => {
        toast.dismiss();
        if (data.error) return myToast.error(data.message);
        setImportedFeed(data.feed);
      },
      onError: () => {
        toast.dismiss();
        myToast.error("There was an error importing your feed");
      },
      onMutate: () => myToast.loading(),
    });

  const { mutate: importFeed, isLoading: isImportingFeed } =
    trpcClient.rss.importFeed.useMutation(
      handleUseMutationAlerts({
        successText: "Podcast imported succesfully",
        callback: () => {
          trpcContext.invalidate();
          setImportedFeed(null);
          props.goBack();
        },
      }),
    );

  const submitFunc = async (data: { rssFeedUrl: string }) => {
    mutate(data);
  };

  return (
    <>
      {importedFeed && (
        <Flex flexDir={"column"} gap={5} p="10px">
          <Heading fontSize={"3xl"}>Is this your Podcast?</Heading>
          <PodcastImportCard feed={importedFeed} />
          <Flex justifyContent={"space-between"}>
            <Button
              onClick={() => setImportedFeed(null)}
              isLoading={isSubmitting || isImportingFeed}
              size="lg"
              alignSelf={"flex-end"}
            >
              Prev
            </Button>
            <Button
              onClick={() => {
                const { rssFeedUrl } = getValues();
                importFeed({ rssFeedUrl });
              }}
              isLoading={isSubmitting || isImportingFeed}
              size="lg"
              alignSelf={"flex-end"}
            >
              Yes, import it
            </Button>
          </Flex>
        </Flex>
      )}
      {!importedFeed && (
        <form onSubmit={handleSubmit(submitFunc)} noValidate>
          <Flex flexDir={"column"} gap={5}>
            <Heading fontSize={"4xl"}>Import from RSS Feed</Heading>
            <FormControlledText
              control={control}
              errors={errors}
              name="rssFeedUrl"
              label="Rss Feed Url"
              autoFocus={true}
            />

            <Flex justifyContent={"space-between"}>
              <Button
                onClick={props.goBack}
                isLoading={isSubmitting || isLoadingFeed}
                size="lg"
                alignSelf={"flex-end"}
              >
                Prev
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || isLoadingFeed}
                size="lg"
                alignSelf={"flex-end"}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        </form>
      )}
    </>
  );
};

export default RssImportForm;
