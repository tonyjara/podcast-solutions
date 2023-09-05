import { Box, Button, Flex, VStack, Text, Link, Icon } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Directories, Prisma } from "@prisma/client";
import { useForm } from "react-hook-form";
import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import {
  defaultDirectoriesValue,
  validateDirectories,
} from "@/components/Validations/Directories.validate";
import { FaPodcast, FaSpotify } from "react-icons/fa";
import { SiGooglepodcasts, SiStitcher, SiTunein } from "react-icons/si";

export type EpisodeWithAudioFiles = Prisma.EpisodeGetPayload<{
  include: { audioFiles: true };
}>;

const DistributionPage = () => {
  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Directories>({
    defaultValues: defaultDirectoriesValue,
    resolver: zodResolver(validateDirectories),
  });

  const { data: fetchedDirectories } =
    trpcClient.podcast.getMyDirectories.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
  useEffect(() => {
    if (!fetchedDirectories) return;
    reset(fetchedDirectories);

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedDirectories]);

  const { mutate, isLoading } =
    trpcClient.podcast.upsertDirectories.useMutation(
      handleUseMutationAlerts({
        successText: "Changes saved",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );

  const submitFunc = (data: Directories) => {
    mutate(data);
  };

  const someError = Object.keys(errors).length > 0;

  return (
    <Box w="100%" display={"flex"} justifyContent={"center"} pb={"100px"}>
      <Flex maxW={"1000px"} w="100%" flexDir={"column"}>
        <form
          onKeyDown={(e) => {
            e.key === "Enter" && e.preventDefault();
          }}
          onSubmit={handleSubmit(submitFunc)}
          noValidate
        >
          <Flex justifyContent={"space-between"} w="100%" mb={"20px"}>
            <Text fontSize={{ base: "2xl", md: "4xl" }}>
              Distribution Directories
            </Text>
            <Button
              size={{ base: "sm", md: "md" }}
              onClick={() => handleSubmit(submitFunc)()}
              isDisabled={isSubmitting || isLoading || !isDirty}
              colorScheme="green"
            >
              Save
            </Button>
          </Flex>
          {someError && (
            <Text py={"10px"} color="red.300">
              There's some issues in the form, please resolve them before
              submitting.
            </Text>
          )}
          <VStack alignItems={"flex-start"}>
            <Text color={"gray.500"} fontSize={"lg"} fontStyle={"italic"}>
              At the moment we do not offer automatic feed listing. You'll find
              guides below some of the major platforms. You only need to list to
              each platform once.
            </Text>

            <Text
              color={"gray.500"}
              fontStyle={"italic"}
              fontSize={"lg"}
              mb={"20px"}
            >
              If you wish to show where you're podcast is available, paste their
              links in the fields below. Otherwise, leave them blank.
            </Text>
            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Apple Podcasts URL"}
              name={"applePodcastsUrl"}
              inputLeft={<Icon as={FaPodcast} />}
            />
            <Link
              target="_blank"
              href="https://blog.podcastsolutions.org/upload-to-apple-podcasts"
            >
              Guide to upload to Apple Podcasts
            </Link>

            <Link
              mb={"20px"}
              target="_blank"
              href="https://podcastsconnect.apple.com/"
            >
              Apple Podcasts Connect
            </Link>
            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Spotify URL"}
              name={"spotifyUrl"}
              inputLeft={<Icon as={FaSpotify} />}
            />
            <Link
              target="_blank"
              href="https://blog.podcastsolutions.org/upload-to-spotify"
            >
              Guide to upload to Spotify
            </Link>

            <Link
              target="_blank"
              href="https://podcasters.spotify.com/dash/home/"
              mb={"20px"}
            >
              Spotify for Podcasters dashboard
            </Link>

            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Google Podcasts URL"}
              name={"googlePodcastsUrl"}
              inputLeft={<Icon as={SiGooglepodcasts} />}
            />

            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Stitcher URL"}
              name={"stitcherUrl"}
              inputLeft={<Icon as={SiStitcher} />}
            />

            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Tune In URL"}
              name={"tuneinUrl"}
              inputLeft={<Icon as={SiTunein} />}
            />

            <FormControlledText
              maxW={"500px"}
              control={control}
              errors={errors}
              label={"Amazon Music URL"}
              name={"amazonMusicUrl"}
              inputLeft={<Icon as={FaPodcast} />}
            />
          </VStack>
        </form>
      </Flex>
    </Box>
  );
};

export default DistributionPage;
